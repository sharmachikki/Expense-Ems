import { TopBar, Panel, PanelBody } from '../design-system';

export function PlaceholderPage({ title, meta }: { title: string; meta: string }) {
  return (
    <>
      <TopBar title={title} meta={meta} />
      <div className="px-8 py-7">
        <Panel>
          <PanelBody padded>
            <p className="text-sm text-slate">
              You're seeing this because your account passed both the frontend and backend authorization checks for
              this module. Build the real feature here.
            </p>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
