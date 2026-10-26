export function setupManifest({ store, catalog }) {
  const el = document.createElement("dialog");
  el.className = "studio manifest-dialog";
  el.innerHTML =
    '<div class="studio-head"><div><div class="eyebrow">MISSION CONTROL / ENGINEERING DATA</div><h2>Assembly manifest</h2></div><button class="icon-button" aria-label="Đóng manifest">×</button></div><div class="manifest-controls"><input placeholder="Search by model, group or ID…" aria-label="Tìm kiếm assembly" /><select aria-label="Sắp xếp assembly"><option value="name">Sort: model name</option><option value="category">Sort: group</option><option value="mass">Sort: mass</option></select></div><div class="table-scroll manifest-table"></div>';
  document.body.append(el);
  el.querySelector("button").onclick = () => el.close();
  const escape = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const render = () => {
    const search = el.querySelector("input").value.toLowerCase(),
      sort = el.querySelector("select").value;
    const rows = store.project.instances
      .map((i) => ({ i, c: catalog.find((c) => c.id === i.componentId) }))
      .filter((x) =>
        (x.c.name + x.c.category + x.i.id).toLowerCase().includes(search),
      )
      .sort((a, b) =>
        sort === "mass"
          ? (b.c.massG ?? -1) - (a.c.massG ?? -1)
          : String(a.c[sort]).localeCompare(String(b.c[sort])),
      );
    el.querySelector(".manifest-table").innerHTML =
      '<table class="asset-table"><caption>' +
      rows.length +
      " instances · engineering dimensions X / Y / Z · millimeters</caption><thead><tr><th>MODEL / INSTANCE</th><th>GROUP</th><th>MASS (g)</th><th>DIMENSIONS (mm)</th><th>POSITION (mm)</th><th>DATA SOURCE</th></tr></thead><tbody>" +
      rows
        .map(
          ({ i, c }) =>
            `<tr><td><strong>${escape(c.name)}</strong><small>${escape(i.id)}</small></td><td>${escape(c.category)}</td><td class="numeric">${c.massG ?? "Unknown"}</td><td class="numeric">${c.dimensionsMm.map((n) => +n.toFixed(2)).join(" × ")}</td><td class="numeric">${i.positionMm.join(" / ")}</td><td><span class="pill">${c.assetId ? "MESH / UNVERIFIED" : "DEMO"}</span></td></tr>`,
        )
        .join("") +
      "</tbody></table>";
  };
  el.querySelector("input").oninput = render;
  el.querySelector("select").onchange = render;
  document.getElementById("manifest-btn").onclick = () => {
    render();
    el.showModal();
  };
  return {
    destroy() {
      el.remove();
      document.getElementById("manifest-btn").onclick = null;
    },
  };
}
