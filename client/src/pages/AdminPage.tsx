import { useState } from 'react';

import { Alert, Button, Logo, Section, Spinner, TextField } from '../components/ui';
import { EditableRowList } from '../components/admin/EditableRowList';
import type { FieldDescriptor } from '../components/admin/EditableRowList';
import { LocalizedTextField } from '../components/admin/LocalizedTextField';
import { UploadField } from '../components/admin/UploadField';
import { uploadFile } from '../features/content/api/content.api';
import { useContentEditor } from '../features/content/hooks/use-content-editor';
import type {
  ContactDetails,
  MetricDoc,
  ReelDoc,
  ServiceDoc,
  SiteContentDocument,
  WorkDoc,
} from '../models/site-content.model';

/**
 * PAGE — the content editor, reachable only at #/admin.
 *
 * Every visible piece of content is edited here, in English and Deutsch.
 *
 * The admin token is typed in per session and held in memory only: never in
 * localStorage, never in the bundle, never in the URL. The server verifies it on
 * every write, so this screen is convenience, not the security boundary.
 */

interface AdminPageProps {
  content: SiteContentDocument;
  onSaved: (content: SiteContentDocument) => void;
  onExit: () => void;
}

const IMAGE_HINT = 'Upload a photo (JPG, PNG, WebP), or paste an https:// link.';

const SERVICE_FIELDS: ReadonlyArray<FieldDescriptor<ServiceDoc>> = [
  { key: 'title', label: 'Title', kind: 'localized', placeholder: 'Brand Management' },
  { key: 'shortDescription', label: 'Tile text', kind: 'localized' },
  { key: 'longDescription', label: 'Text when expanded', kind: 'localized', rows: 4 },
];

const METRIC_FIELDS: ReadonlyArray<FieldDescriptor<MetricDoc>> = [
  { key: 'value', label: 'Number', placeholder: '250K+' },
  { key: 'label', label: 'Label', kind: 'localized', placeholder: 'Followers reached' },
];

const WORK_FIELDS: ReadonlyArray<FieldDescriptor<WorkDoc>> = [
  { key: 'title', label: 'Cuisine or client', kind: 'localized', placeholder: 'South Indian' },
  {
    key: 'imageUrl',
    label: 'Image',
    kind: 'image',
    placeholder: '/uploads/south-indian.jpg',
    hint: IMAGE_HINT,
  },
  { key: 'description', label: 'Description', kind: 'localized', rows: 2 },
];

const REEL_FIELDS: ReadonlyArray<FieldDescriptor<ReelDoc>> = [
  { key: 'title', label: 'Title', kind: 'localized', placeholder: 'Kitchen rush' },
  {
    key: 'instagramUrl',
    label: 'Instagram URL',
    placeholder: 'https://www.instagram.com/reel/…',
    hint: 'Opens in a new tab when the cover is clicked.',
  },
  {
    key: 'thumbnailUrl',
    label: 'Cover photo (optional)',
    kind: 'image',
    placeholder: '/uploads/reel-cover.jpg',
    hint: 'Leave blank to show a branded tile.',
  },
];

const CONTACT_FIELDS: ReadonlyArray<{ key: keyof ContactDetails; label: string }> = [
  { key: 'address', label: 'Address' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'instagramUrl', label: 'Instagram URL' },
  { key: 'facebookUrl', label: 'Facebook URL' },
  { key: 'youtubeUrl', label: 'YouTube URL' },
  { key: 'tiktokUrl', label: 'TikTok URL' },
];

export const AdminPage = ({ content, onSaved, onExit }: AdminPageProps) => {
  const [token, setToken] = useState('');
  const editor = useContentEditor(content);
  const { singles, updateSingles } = editor;

  // Uploads need the same token as saving; ask for it first rather than fail on the server.
  const upload = (file: File): Promise<string> =>
    token.trim()
      ? uploadFile(file, token.trim())
      : Promise.reject(new Error('Enter your admin token at the top first.'));

  const onSave = async () => {
    const saved = await editor.save(token);
    if (saved) {
      onSaved(saved);
    }
  };

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-32">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-6">
        <div className="flex items-center gap-4">
          <Logo variant="mark" height={40} />
          <div>
            <h1 className="text-xl font-bold text-white">Content editor</h1>
            <p className="text-sm text-brand-200">
              Everything on the site, in English and Deutsch. Empty German fields show the English
              text.
            </p>
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
            placeholder="admin.token from jeebhar.config.json"
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
          <fieldset className="grid gap-4 rounded-2xl border border-white/10 bg-brand-800/30 p-5">
            <legend className="px-2 text-lg font-semibold text-white">Top of the page</legend>
            <LocalizedTextField
              label="Small line above the heading"
              value={singles.heroEyebrow}
              onChange={(heroEyebrow) => updateSingles({ heroEyebrow })}
            />
            <LocalizedTextField
              label="Heading"
              rows={2}
              value={singles.heroHeading}
              onChange={(heroHeading) => updateSingles({ heroHeading })}
            />
            <LocalizedTextField
              label="Text under the heading"
              rows={3}
              value={singles.heroSubheading}
              onChange={(heroSubheading) => updateSingles({ heroSubheading })}
            />
            <UploadField
              accept="image"
              label="Banner image behind the text"
              value={singles.heroImageUrl}
              placeholder="/brand/hero-banner.jpg"
              onChange={(heroImageUrl) => updateSingles({ heroImageUrl })}
              upload={upload}
              hint="A wide photo (about 2400 × 1000). The left side is darkened so the text stays readable. Leave empty for a plain background."
            />
          </fieldset>

          <EditableRowList
            legend="Our Services"
            description="Tiles that expand into the long text when clicked."
            list={editor.services}
            fields={SERVICE_FIELDS}
            addLabel="Add service"
            emptyMessage="No services yet."
            upload={upload}
          />

          <EditableRowList
            legend="Our Experience — media kit numbers"
            description="Followers, interactions and other headline numbers. Up to 12."
            list={editor.metrics}
            fields={METRIC_FIELDS}
            addLabel="Add number"
            emptyMessage="No numbers yet."
            upload={upload}
          />

          <EditableRowList
            legend="Our Work"
            description="One card per cuisine or client. Rows without a title and image are dropped on save."
            list={editor.work}
            fields={WORK_FIELDS}
            addLabel="Add work item"
            emptyMessage="No work items yet."
            upload={upload}
          />

          <EditableRowList
            legend="Our Reels — food &amp; ads"
            description="Food vlogs and ad creatives."
            list={editor.reels}
            fields={REEL_FIELDS}
            addLabel="Add food reel"
            emptyMessage="No food reels yet."
            upload={upload}
          />

          <EditableRowList
            legend="Travel Reels"
            description="Destination and travel storytelling."
            list={editor.travelReels}
            fields={REEL_FIELDS}
            addLabel="Add travel reel"
            emptyMessage="No travel reels yet."
            upload={upload}
          />

          <fieldset className="grid gap-4 rounded-2xl border border-white/10 bg-brand-800/30 p-5">
            <legend className="px-2 text-lg font-semibold text-white">Media kit</legend>
            <UploadField
              accept="document"
              label="Media kit file (PDF or Word)"
              value={singles.mediaKitUrl}
              placeholder="/brand/media-kit.pdf"
              onChange={(mediaKitUrl) => updateSingles({ mediaKitUrl })}
              upload={upload}
              hint="Opened by the “Media Kit” button. A PDF opens in the browser; a Word file downloads. Upload, then Save changes."
            />
          </fieldset>

          <fieldset className="grid gap-4 rounded-2xl border border-white/10 bg-brand-800/30 p-5 md:grid-cols-2">
            <legend className="px-2 text-lg font-semibold text-white">
              Contact details &amp; social links (footer)
            </legend>
            <TextField
              label="Brand name"
              value={singles.brandName}
              onChange={(brandName) => updateSingles({ brandName })}
            />
            {CONTACT_FIELDS.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                value={singles.contact[field.key]}
                onChange={(value) =>
                  updateSingles({ contact: { ...singles.contact, [field.key]: value } })
                }
              />
            ))}
          </fieldset>
        </div>

        {/* Sticky so Save is reachable from anywhere on this long page. */}
        <div className="sticky bottom-0 -mx-4 mt-8 border-t border-white/10 bg-brand-950/95 px-4 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
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
            <Alert tone={editor.state === 'saved' ? 'success' : 'error'} className="mt-3">
              {editor.feedback}
            </Alert>
          )}
        </div>
      </Section>
    </main>
  );
};
