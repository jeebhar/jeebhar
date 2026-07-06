import { FormEvent, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { getContent, submitContact, updateContent } from "./api";
import { ContactPayload, ReelItem, SiteContent, WorkItem } from "./types";

const emptyContact: ContactPayload = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  body: ""
};

export default function App() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [expandedServiceIndex, setExpandedServiceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [contactResponse, setContactResponse] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactPayload>(emptyContact);
  const [editableWork, setEditableWork] = useState<WorkItem[]>([]);
  const [editableReels, setEditableReels] = useState<ReelItem[]>([]);
  const [savingEditor, setSavingEditor] = useState(false);

  const workListRef = useRef<HTMLDivElement | null>(null);
  const reelListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const loadedContent = await getContent();
        setContent(loadedContent);
        setEditableWork(loadedContent.work.map((item) => ({ ...item })));
        setEditableReels(loadedContent.reels.map((item) => ({ ...item })));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load website content.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const mediaKitPath = useMemo(() => {
    // EDITABLE: replace this with your final media kit PDF/DOC path.
    return "/assets/media-kit.pdf";
  }, []);

  const scrollTo = (sectionId: string) => {
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollCarousel = (ref: RefObject<HTMLDivElement>, direction: number) => {
    ref.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  const onSubmitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactResponse("");

    if (
      contactForm.name.trim().length < 2 ||
      !contactForm.email.includes("@") ||
      contactForm.phone.trim().length < 7 ||
      contactForm.subject.trim().length < 3 ||
      contactForm.body.trim().length < 10
    ) {
      setContactResponse("Please fill all fields correctly before submitting.");
      return;
    }

    try {
      const message = await submitContact(contactForm);
      setContactResponse(message);
      setContactForm(emptyContact);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit form.";
      setContactResponse(message);
    }
  };

  const saveMediaContent = async () => {
    if (!content) {
      return;
    }

    setSavingEditor(true);
    const payload: SiteContent = {
      ...content,
      work: editableWork.filter((item) => item.title && item.imageUrl),
      reels: editableReels.filter((item) => item.title && item.thumbnailUrl && item.instagramUrl)
    };

    try {
      const updated = await updateContent(payload);
      setContent(updated);
      setEditableWork(updated.work.map((item) => ({ ...item })));
      setEditableReels(updated.reels.map((item) => ({ ...item })));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save content.";
      setContactResponse(message);
    } finally {
      setSavingEditor(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-200">
        {errorMessage || "Loading Jeebhar..."}
      </main>
    );
  }

  if (!content) {
    return (
      <main className="grid min-h-screen place-items-center text-red-300">
        {errorMessage || "Unable to load content."}
      </main>
    );
  }

  return (
    <div className="text-slate-100">
      <header className="sticky top-0 z-30 border-b border-indigo-300/25 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            className="text-xl font-extrabold text-white"
            onClick={() => scrollTo("home")}
          >
            {content.brandName}
          </button>
          <button
            type="button"
            className="rounded border border-indigo-400 px-3 py-1 text-indigo-100 md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            Menu
          </button>
          <nav
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } absolute left-0 right-0 top-full flex-col gap-2 border-b border-indigo-300/25 bg-slate-950 px-4 py-3 md:static md:flex md:flex-row md:items-center md:border-none md:bg-transparent md:p-0`}
          >
            {[
              { label: "Home", id: "home" },
              { label: "Our Services", id: "services" },
              { label: "Our Work", id: "work" },
              { label: "Our Reels", id: "reels" },
              { label: "Contact Us", id: "contact" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded px-2 py-1 text-left text-indigo-100 hover:bg-indigo-400/20 md:text-sm"
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded px-2 py-1 text-left text-indigo-100 hover:bg-indigo-400/20 md:text-sm"
              onClick={() => window.open(mediaKitPath, "_blank", "noopener,noreferrer")}
            >
              Media Kit
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section id="home" className="grid min-h-[72vh] content-center gap-4 py-10">
          <p className="font-bold text-indigo-300">For Restaurants and Food Brands</p>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
            {content.heroHeading}
          </h1>
          <p className="max-w-3xl text-lg text-slate-200">{content.heroSubheading}</p>
          <button
            type="button"
            className="w-fit rounded-md bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400"
            onClick={() => scrollTo("contact")}
          >
            Lets Reimagine Your Business
          </button>
        </section>

        <section id="services" className="py-10">
          <h2 className="mb-5 text-3xl font-bold text-white">Our Services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.services.map((service, index) => (
              <button
                key={service._id ?? service.title}
                type="button"
                className={`rounded-xl border p-4 text-left ${
                  expandedServiceIndex === index
                    ? "border-indigo-300 bg-indigo-900/45"
                    : "border-indigo-200/25 bg-slate-900/70"
                }`}
                onClick={() => setExpandedServiceIndex(index)}
              >
                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                <p className="mt-1 text-slate-300">{service.shortDescription}</p>
                {expandedServiceIndex === index && (
                  <p className="mt-3 border-t border-indigo-200/30 pt-3 text-slate-200">
                    {service.longDescription}
                  </p>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="mb-5 text-3xl font-bold text-white">Our Experience</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.mediaKitMetrics.map((metric) => (
              <article
                key={metric._id ?? `${metric.label}-${metric.value}`}
                className="rounded-xl border border-indigo-200/25 bg-slate-900/70 p-4"
              >
                <h3 className="text-3xl font-bold text-white">{metric.value}</h3>
                <p className="mt-1 text-slate-300">{metric.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-bold text-white">Our Work</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-indigo-300 text-lg"
                onClick={() => scrollCarousel(workListRef, -1)}
                aria-label="Previous work"
              >
                {"<"}
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-indigo-300 text-lg"
                onClick={() => scrollCarousel(workListRef, 1)}
                aria-label="Next work"
              >
                {">"}
              </button>
            </div>
          </div>
          <div ref={workListRef} className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-3">
            {content.work.map((item) => (
              <article
                key={item._id ?? `${item.title}-${item.imageUrl}`}
                className="overflow-hidden rounded-xl border border-indigo-200/25 bg-slate-900/70"
              >
                <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
                <h3 className="px-4 pt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="px-4 pb-4 pt-1 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reels" className="py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-bold text-white">Our Reels</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-indigo-300 text-lg"
                onClick={() => scrollCarousel(reelListRef, -1)}
                aria-label="Previous reels"
              >
                {"<"}
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-full border border-indigo-300 text-lg"
                onClick={() => scrollCarousel(reelListRef, 1)}
                aria-label="Next reels"
              >
                {">"}
              </button>
            </div>
          </div>
          <div ref={reelListRef} className="grid auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-3">
            {content.reels.map((reel) => (
              <a
                key={reel._id ?? `${reel.title}-${reel.instagramUrl}`}
                className="overflow-hidden rounded-xl border border-indigo-200/25 bg-slate-900/70"
                href={reel.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={reel.thumbnailUrl} alt={reel.title} className="h-52 w-full object-cover" />
                <h3 className="px-4 pt-3 text-lg font-semibold text-white">{reel.title}</h3>
                <p className="px-4 pb-4 pt-1 text-slate-300">Click to open on Instagram</p>
              </a>
            ))}
          </div>
        </section>

        <section id="contact" className="py-10">
          <h2 className="mb-5 text-3xl font-bold text-white">Contact Us</h2>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmitContact}>
            {[
              { label: "Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone Number", key: "phone", type: "text" },
              { label: "Subject", key: "subject", type: "text" }
            ].map((field) => (
              <label key={field.key} className="grid gap-2 text-sm text-indigo-100">
                {field.label}
                <input
                  type={field.type}
                  value={contactForm[field.key as keyof ContactPayload] as string}
                  onChange={(event) =>
                    setContactForm((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white outline-none focus:border-indigo-300"
                />
              </label>
            ))}
            <label className="grid gap-2 text-sm text-indigo-100 md:col-span-2">
              Email Body
              <textarea
                rows={5}
                value={contactForm.body}
                onChange={(event) => setContactForm((prev) => ({ ...prev, body: event.target.value }))}
                className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white outline-none focus:border-indigo-300"
              />
            </label>
            <button
              type="submit"
              className="w-fit rounded-md bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400"
            >
              Send Inquiry
            </button>
          </form>
          <p className="mt-3 text-indigo-200">{contactResponse}</p>
        </section>

        <section className="border-t border-dashed border-indigo-300/35 py-10">
          <h2 className="mb-2 text-3xl font-bold text-white">Edit Work and Reels Content</h2>
          <p className="mb-5 text-slate-300">
            This section lets you add/edit image cards and Instagram reel links directly.
          </p>

          <h3 className="mb-3 text-xl font-semibold text-white">Work Images</h3>
          <div className="space-y-3">
            {editableWork.map((item, index) => (
              <div key={index} className="grid gap-2 lg:grid-cols-[1fr,1fr,1fr,auto]">
                <input
                  value={item.title}
                  onChange={(event) =>
                    setEditableWork((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, title: event.target.value } : entry))
                    )
                  }
                  placeholder="Title"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <input
                  value={item.imageUrl}
                  onChange={(event) =>
                    setEditableWork((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, imageUrl: event.target.value } : entry))
                    )
                  }
                  placeholder="Image URL"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <input
                  value={item.description}
                  onChange={(event) =>
                    setEditableWork((prev) =>
                      prev.map((entry, i) =>
                        i === index ? { ...entry, description: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Description"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  className="rounded-md border border-indigo-300/70 px-3 py-2 text-indigo-100"
                  onClick={() => setEditableWork((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 rounded-md border border-indigo-300/70 px-3 py-2 text-indigo-100"
            onClick={() => setEditableWork((prev) => [...prev, { title: "", imageUrl: "", description: "" }])}
          >
            Add Work Item
          </button>

          <h3 className="mb-3 mt-8 text-xl font-semibold text-white">Reels</h3>
          <div className="space-y-3">
            {editableReels.map((reel, index) => (
              <div key={index} className="grid gap-2 lg:grid-cols-[1fr,1fr,1fr,auto]">
                <input
                  value={reel.title}
                  onChange={(event) =>
                    setEditableReels((prev) =>
                      prev.map((entry, i) => (i === index ? { ...entry, title: event.target.value } : entry))
                    )
                  }
                  placeholder="Title"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <input
                  value={reel.thumbnailUrl}
                  onChange={(event) =>
                    setEditableReels((prev) =>
                      prev.map((entry, i) =>
                        i === index ? { ...entry, thumbnailUrl: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Thumbnail URL"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <input
                  value={reel.instagramUrl}
                  onChange={(event) =>
                    setEditableReels((prev) =>
                      prev.map((entry, i) =>
                        i === index ? { ...entry, instagramUrl: event.target.value } : entry
                      )
                    )
                  }
                  placeholder="Instagram URL"
                  className="rounded-md border border-indigo-300/50 bg-slate-900/80 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  className="rounded-md border border-indigo-300/70 px-3 py-2 text-indigo-100"
                  onClick={() => setEditableReels((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 rounded-md border border-indigo-300/70 px-3 py-2 text-indigo-100"
            onClick={() =>
              setEditableReels((prev) => [
                ...prev,
                { title: "", thumbnailUrl: "", instagramUrl: "" }
              ])
            }
          >
            Add Reel
          </button>

          <div className="mt-6">
            <button
              type="button"
              className="rounded-md bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/60"
              onClick={saveMediaContent}
              disabled={savingEditor}
            >
              {savingEditor ? "Saving..." : "Save Work/Reels Updates"}
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-indigo-300/25 px-4 py-10 text-center text-slate-200">
        <h3 className="text-xl font-bold text-white">{content.brandName}</h3>
        <p className="mt-2">{content.contact.address}</p>
        <p className="mt-1">
          <a href={`mailto:${content.contact.email}`} className="text-indigo-200 hover:text-indigo-100">
            {content.contact.email}
          </a>
        </p>
        <p className="mt-1">
          <a href={`tel:${content.contact.phone}`} className="text-indigo-200 hover:text-indigo-100">
            {content.contact.phone}
          </a>
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <a href={content.contact.facebookUrl} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
          <a href={content.contact.youtubeUrl} target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href={content.contact.instagramUrl} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href={content.contact.tiktokUrl} target="_blank" rel="noopener noreferrer">
            TikTok
          </a>
        </div>
      </footer>
    </div>
  );
}
