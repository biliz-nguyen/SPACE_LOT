import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Search,
  Plus,
  ChevronDown,
  Box,
  Layers,
  PackageOpen,
  X,
} from "lucide-react";
import {
  CATALOG_FAMILIES,
  CATALOG_CATEGORIES,
  filterCatalog,
  CATEGORY_IMAGE_MAP,
} from "../catalog.js";
import { catalog, store, useProject, number, type Part } from "@/lib/project";
import { Button } from "./ui/button";
export function PartsCatalog({
  notify,
}: {
  notify: (message: string) => void;
}) {
  useProject();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [expanded, setExpanded] = useState<string[]>(["frame", "motor"]);
  const matches = filterCatalog(catalog, category, search) as Part[];
  return (
    <>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">COMPONENT LIBRARY</span>
          <h2>Parts catalog</h2>
        </div>
        <span className="count-badge" id="part-count">
          {catalog.length}
        </span>
      </div>
      <div className="catalog-search">
        <Search size={17} />
        <input
          id="catalog-search"
          aria-label="Tìm linh kiện"
          placeholder="Find a component…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <button aria-label="Xóa tìm kiếm" onClick={() => setSearch("")}>
            <X size={15} />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>
      <label className="sr-only" htmlFor="catalog-filter">
        Lọc theo nhóm linh kiện
      </label>
      <select
        id="catalog-filter"
        className="catalog-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">All component types</option>
        {CATALOG_CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="catalog-results">
        <span id="catalog-match-count" aria-live="polite">
          {matches.length} components
        </span>
        <button
          id="catalog-toggle-all"
          onClick={() =>
            setExpanded(
              expanded.length === CATALOG_CATEGORIES.length
                ? []
                : CATALOG_CATEGORIES.map((c) => c.id),
            )
          }
        >
          {expanded.length === CATALOG_CATEGORIES.length
            ? "Collapse all"
            : "Expand all"}
        </button>
      </div>
      <div className="catalog-scroll">
        <div id="catalog-list">
          <Accordion.Root
            type="multiple"
            value={
              search || category !== "all"
                ? CATALOG_CATEGORIES.map((c) => c.id)
                : expanded
            }
            onValueChange={setExpanded}
          >
            {CATALOG_FAMILIES.map((family) => {
              const categories = family.categories.filter((c) =>
                matches.some((p) => p.category === c.id),
              );
              return categories.length ? (
                <div className="catalog-family" key={family.name}>
                  <div className="family-label">{family.name}</div>
                  {categories.map((c) => {
                    const items = matches.filter((p) => p.category === c.id);
                    return (
                      <Accordion.Item
                        key={c.id}
                        value={c.id}
                        className="catalog-section"
                      >
                        <Accordion.Header>
                          <Accordion.Trigger
                            className="catalog-trigger"
                            data-toggle-category={c.id}
                          >
                            <span className="category-symbol">
                            {CATEGORY_IMAGE_MAP[c.id] ? (
                              <img
                                src={CATEGORY_IMAGE_MAP[c.id]}
                                alt=""
                                className="category-icon-img"
                              />
                            ) : (
                              <Box size={17} />
                            )}
                          </span>
                            <span>{c.label}</span>
                            <small>{items.length}</small>
                            <ChevronDown size={14} className="chevron" />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="catalog-content">
                          {items.map((part) => (
                            <div className="part-card part-row" key={part.id}>
                              <div className="part-card-main">
                                <div className="part-card-name">
                                  {CATEGORY_IMAGE_MAP[part.category] ? (
                                    <img
                                      src={CATEGORY_IMAGE_MAP[part.category]}
                                      alt=""
                                      className="part-icon-img"
                                    />
                                  ) : (
                                    <Layers size={14} className="part-icon" />
                                  )}
                                  <strong>{part.name}</strong>
                                </div>
                                <span className="part-sub">{part.subtitle}</span>
                              </div>
                              <div className="part-card-side">
                                <span className="part-meta">
                                  {part.massG === null
                                    ? "Unknown"
                                    : `${number(part.massG, 0)} g`}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  data-add={part.id}
                                  aria-label={`Thêm ${part.name}`}
                                  onClick={() =>
                                    notify(
                                      store.add(part.id)
                                        ? `Đã thêm ${part.name}`
                                        : "Scene đạt giới hạn 80 linh kiện.",
                                    )
                                  }
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </Accordion.Content>
                      </Accordion.Item>
                    );
                  })}
                </div>
              ) : null;
            })}
          </Accordion.Root>
          {matches.length === 0 ? (
            <div className="empty-state">
              <Search />
              <strong>Không tìm thấy linh kiện</strong>
              <p>Thử từ khóa hoặc nhóm khác.</p>
            </div>
          ) : null}
        </div>
        <div className="family-label hangar-label">
          MY LOCAL ASSETS <PackageOpen size={14} />
        </div>
        <div id="asset-shelf" />
        <div className="library-note">
          <Box size={18} />
          <p>
            Demo specifications.
            <br />
            <span>Verify against your hardware datasheets.</span>
          </p>
        </div>
      </div>
      <div className="panel-foot">
        <span className="status-led" />
        Private, on this browser
      </div>
    </>
  );
}
