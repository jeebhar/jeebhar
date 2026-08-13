import { useState } from 'react';

import { Alert, Button, Logo, Section, Spinner, TextField } from '../components/ui';
import { EditableRowList } from '../components/admin/EditableRowList';
import type { FieldDescriptor } from '../components/admin/EditableRowList';
import { useContentEditor } from '../features/content/hooks/use-content-editor';
import type { ReelItem, SiteContent, WorkItem } from '../models/site-content.model';

/**
 * PAGE — the content editor, reachable only at #/admin.
 *
 * The admin token is typed in per session and held in memory only: never in
 * localStorage, never in the bundle, never in the URL. The server verifies it on
 * every write, so this screen is convenience, not the security boundary.
 */

interface AdminPageProps {
  content: SiteContent;
  onSaved: (content: SiteContent) => void;
  onExit: () => void;
}

const WORK_FIELDS: ReadonlyArray<FieldDescriptor<WorkItem>> = [
  { key: 'title', label: 'Cuisine or client', placeholder: 'South Indian' },
  {
    key: 'imageUrl',
    label: 'Image URL',
    placeholder: 'https://… or /work/south-indian.jpg',
    hint: 'An https:// link, or a path to a file you added under client/public.',
  },
  { key: 'description', label: 'Description', rows: 2, placeholder: 'What did we deliver?' },
];

const REEL_FIELDS: ReadonlyArray<FieldDescriptor<ReelItem>> = [
  { key: 'title', label: 'Title', placeholder: 'Kitchen rush' },
  {
    key: 'instagramUrl',
    label: 'Instagram URL',
    placeholder: 'https://www.instagram.com/reel/…',
  },
  {
    key: 'thumbnailUrl',
    label: 'Cover image (optional)',
    placeholder: '/reels/DQWG611DCCr.jpg',
    hint: 'Leave blank to show a branded tile. See client/public/reels/README.md.',
  },
];

export const AdminPage = ({ content, onSaved, onExit }: AdminPageProps) => {
  const [token, setToken] = useState('');
  const editor = useContentEditor(content);

  const onSave = async () => {
    const saved = await editor.save(token);
    if (saved) {
      onSaved(saved);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-6">
        <div className="flex items-center gap-4">
          <Logo variant="mark" height={40} />
          <div>
            <h1 className="text-xl font-bold text-white">Content editor</h1>
            <p className="text-sm text-brand-200">Manage the Work, Reels and Travel carousels.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={onExit}>
          &larr; Back to site
        </Button>
      </header>

      <Section title="Authentication">
        <div className="grid gap-4 md:max-w-md">
          <TextField
            label="Admin token"
            type="password"
            value={token}
            autoComplete="current-password"
            placeholder="Paste your ADMIN_TOKEN"
            onChange={setToken}
          />
          <p className="text-xs text-brand-200">
            Held in memory for this tab only. It is never stored in the browser and never shipped in
            the build.
          </p>
        </div>
      </Section>

      <Section title="Content">
        <div className="grid gap-8">
          <EditableRowList
            legend="Our Work"
            description="One card per cuisine or client. Rows without a title and image are dropped on save."
            list={editor.work}
            fields={WORK_FIELDS}
            addLabel="Add work item"
            emptyMessage="No work items yet."
          />

          <EditableRowList
            legend="Our Reels — food &amp; ads"
            description="Food vlogs and ad creatives."
            list={editor.reels}
            fields={REEL_FIELDS}
            addLabel="Add food reel"
            emptyMessage="No food reels yet."
          />

          <EditableRowList
            legend="Travel Reels"
            description="Destination and travel storytelling."
            list={editor.travelReels}
            fields={REEL_FIELDS}
            addLabel="Add travel reel"
            emptyMessage="No travel reels yet."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            variant="accent"
            size="lg"
            onClick={() => void onSave()}
            disabled={editor.state === 'saving' || !editor.dirty}
            aria-busy={editor.state === 'saving'}
          >
            {editor.state === 'saving' ? <Spinner label="Saving" /> : null}
            {editor.state === 'saving' ? 'Saving…' : 'Save changes'}
          </Button>

          <Button variant="ghost" onClick={editor.reset} disabled={!editor.dirty}>
            Discard changes
          </Button>

          {!editor.dirty && editor.state !== 'saved' && (
            <span className="text-sm text-brand-200">No unsaved changes.</span>
          )}
        </div>

        {editor.feedback && (
          <Alert tone={editor.state === 'saved' ? 'success' : 'error'} className="mt-4">
            {editor.feedback}
          </Alert>
        )}
      </Section>
    </main>
  );
};
