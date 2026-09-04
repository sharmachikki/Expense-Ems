import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TopBar, Panel, PanelHead, PanelBody, Button, StatusPill, Table, TableHead, Td } from '../design-system';
import { useCreateExpense, useMyExpenses, useSubmitExpense, ExpenseItemInput } from '../lib/expenses';
import { STATUS_PILL } from '../lib/statusPill';

interface FormValues {
  purpose: string;
  payTo: string;
  items: ExpenseItemInput[];
}

const EMPTY_ITEM: ExpenseItemInput = { description: '', category: '', amount: 0, date: '' };

export function ExpenseEntryPage() {
  const { data: expenses, isLoading } = useMyExpenses();
  const createExpense = useCreateExpense();
  const submitExpense = useSubmitExpense();
  const [formError, setFormError] = useState<string | null>(null);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { purpose: '', payTo: '', items: [EMPTY_ITEM] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await createExpense.mutateAsync({
        purpose: values.purpose,
        payTo: values.payTo || undefined,
        items: values.items.map((i) => ({ ...i, amount: Number(i.amount) })),
      });
      reset({ purpose: '', payTo: '', items: [EMPTY_ITEM] });
    } catch {
      setFormError('Could not save this expense. Check the fields and try again.');
    }
  }

  return (
    <>
      <TopBar title="Expense Management" meta="Manual entry & history" />
      <div className="px-8 py-7">
        <Panel>
          <PanelHead title="New expense" />
          <PanelBody padded>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-soft">Purpose</label>
                  <input
                    {...register('purpose', { required: true })}
                    className="rounded border border-line px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    placeholder="Client site visit — Pune"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-soft">Pay to</label>
                  <input
                    {...register('payTo')}
                    className="rounded border border-line px-3 py-2 text-sm focus:border-gold focus:outline-none"
                    placeholder="Self / Vendor name"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink-soft">Line items</label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => append(EMPTY_ITEM)}>
                    + Add item
                  </Button>
                </div>
                <div className="space-y-2">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2">
                      <input
                        {...register(`items.${idx}.description`, { required: true })}
                        placeholder="Description"
                        className="rounded border border-line px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        {...register(`items.${idx}.category`)}
                        placeholder="Category"
                        className="rounded border border-line px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${idx}.amount`, { required: true, valueAsNumber: true, min: 0.01 })}
                        placeholder="Amount"
                        className="rounded border border-line px-2.5 py-1.5 text-right font-mono text-sm focus:border-gold focus:outline-none"
                      />
                      <input
                        type="date"
                        {...register(`items.${idx}.date`, { required: true })}
                        className="rounded border border-line px-2.5 py-1.5 text-sm focus:border-gold focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={fields.length === 1}
                        onClick={() => remove(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {formError && <div className="text-[13px] text-red">{formError}</div>}
              <Button type="submit" variant="gold" disabled={createExpense.isPending}>
                {createExpense.isPending ? 'Saving…' : 'Save as draft'}
              </Button>
            </form>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHead title="My expenses" />
          <PanelBody>
            {isLoading && <div className="empty p-10 text-center text-sm text-slate-light">Loading…</div>}
            {!isLoading && (expenses?.length ?? 0) === 0 && (
              <div className="p-10 text-center text-sm text-slate-light">No expenses yet — add one above.</div>
            )}
            {!isLoading && (expenses?.length ?? 0) > 0 && (
              <Table>
                <TableHead columns={['Purpose', 'Items', 'Amount', 'Status', '']} alignRight={[2]} />
                <tbody>
                  {expenses!.map((exp) => (
                    <tr key={exp.id}>
                      <Td>{exp.purpose}</Td>
                      <Td>{exp.items.length}</Td>
                      <Td amt>₹{Number(exp.totalAmount).toFixed(2)}</Td>
                      <Td>
                        <StatusPill color={STATUS_PILL[exp.status].color}>{STATUS_PILL[exp.status].label}</StatusPill>
                      </Td>
                      <Td>
                        {exp.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={submitExpense.isPending}
                            onClick={() => submitExpense.mutate(exp.id)}
                          >
                            Submit
                          </Button>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
