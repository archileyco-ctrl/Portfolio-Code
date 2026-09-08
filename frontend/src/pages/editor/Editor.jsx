import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove,
} from "@dnd-kit/sortable";
import {
  adminFetchAll, adminDelete, adminReorder,
  adminUpdate, WORLDS, pad,
} from "@/lib/api";
import { SortableItem, DragHandle } from "@/components/editor/SortableItem";
import ProjectForm from "./ProjectForm";
import SettingsView from "./SettingsView";

function WorldGroup({ world, list, onReordered, toggle, remove, setEditing, setView }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = list.findIndex((p) => p.id === active.id);
    const newIndex = list.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(list, oldIndex, newIndex);

    onReordered(world.key, reordered);

    try {
      await adminReorder(reordered.map((p) => p.id));
    } catch {
      toast.error("Reorder failed");
    }
  };

  return (
    <div className="mb-10">
      <div
        className="mono text-mute hairline-b pb-2 mb-2"
        data-testid={`world-group-${world.key}`}
      >
        {world.title} — {list.length}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={list.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.map((p, gi) => (
            <SortableItem key={p.id} id={p.id}>
              {({ attributes, listeners }) => (
                <div
                  className="hairline-b py-3 flex items-center gap-4 bg-paper"
                  data-testid={`editor-row-${p.slug}`}
                >
                  <DragHandle
                    attributes={attributes}
                    listeners={listeners}
                    testid={`drag-handle-${p.slug}`}
                  />

                  <span className="mono text-mute w-8">
                    {pad(gi)}
                  </span>

                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt=""
                      className="w-16 h-11 object-cover border border-line"
                    />
                  ) : (
                    <div className="w-16 h-11 border border-line" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">
                      {p.title}
                    </div>
                    <div className="mono text-mute">
                      {p.category} — {p.year}
                    </div>
                  </div>

                  <button
                    data-testid={`toggle-publish-${p.slug}`}
                    onClick={() => toggle(p, "published")}
                    className={`mono px-3 py-1 border ${
                      p.published
                        ? "bg-ink text-paper border-transparent"
                        : "border-line text-mute"
                    }`}
                    title="Publish / unpublish"
                  >
                    {p.published ? "Published" : "Draft"}
                  </button>

                  <button
                    data-testid={`toggle-featured-${p.slug}`}
                    onClick={() => toggle(p, "featured")}
                    className={`mono px-3 py-1 border ${
                      p.featured
                        ? "text-accent border-accent"
                        : "border-line text-mute"
                    }`}
                    title="Show on home page"
                  >
                    {p.featured ? "Featured" : "Feature"}
                  </button>

                  <a
                    href={`/project/${p.slug}${p.published ? "" : "?preview=1"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="e-btn"
                    data-testid={`preview-${p.slug}`}
                  >
                    Preview
                  </a>

                  <button
                    className="e-btn"
                    data-testid={`edit-${p.slug}`}
                    onClick={() => {
                      setEditing(p);
                      setView("form");
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="e-btn hover:!bg-accent hover:!border-accent"
                    data-testid={`delete-${p.slug}`}
                    onClick={() => remove(p)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {list.length === 0 && (
        <div className="mono text-mute py-6">
          No projects yet — add one.
        </div>
      )}
    </div>
  );
}

export default function Editor() {
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(null);

  const load = () =>
    adminFetchAll()
      .then(setProjects)
      .catch(() => toast.error("Could not load projects"));

  useEffect(() => {
    load();
  }, []);

  const toggle = async (p, field) => {
    try {
      await adminUpdate(p.id, {
        ...p,
        [field]: !p[field],
      });

      load();
    } catch {
      toast.error("Update failed");
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await adminDelete(p.id);
      toast.success(`"${p.title}" deleted`);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const onReordered = (worldKey, reorderedList) => {
    setProjects((prev) => {
      const others = prev.filter((p) => p.world !== worldKey);
      return [...others, ...reorderedList];
    });
  };

  if (view === "form") {
    return (
      <ProjectForm
        initial={editing}
        onSaved={() => {
          setView("list");
          setEditing(null);
          load();
        }}
        onCancel={() => {
          setView("list");
          setEditing(null);
        }}
      />
    );
  }

  if (view === "settings") {
    return <SettingsView onBack={() => setView("list")} />;
  }

  return (
    <div
      className="min-h-screen bg-paper text-ink"
      data-testid="editor-dashboard"
    >
      <header className="hairline-b px-4 md:px-10 h-14 flex items-center justify-between sticky top-0 bg-paper/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold lowercase tracking-tight text-sm">
            abearchitectstudio
          </span>
          <span className="mono text-mute">Editor</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="e-btn"
            data-testid="view-site-button"
          >
            View site
          </a>

          <button
            className="e-btn"
            data-testid="settings-button"
            onClick={() => setView("settings")}
          >
            Settings
          </button>

          <button
            className="e-btn e-btn-solid"
            data-testid="add-project-button"
            onClick={() => {
              setEditing(null);
              setView("form");
            }}
          >
            Add new project
          </button>
        </div>
      </header>

      <div className="px-4 md:px-10 py-8 max-w-6xl">
        <div className="flex justify-between items-baseline mb-6">
          <h1
            className="display text-3xl"
            data-testid="editor-heading"
          >
            Projects
          </h1>

          <span className="mono text-mute">
            {projects.length} total
          </span>
        </div>

        {Object.values(WORLDS).map((w) => (
          <WorldGroup
            key={w.key}
            world={w}
            list={projects.filter((p) => p.world === w.key)}
            onReordered={onReordered}
            toggle={toggle}
            remove={remove}
            setEditing={setEditing}
            setView={setView}
          />
        ))}
      </div>
    </div>
  );
}
