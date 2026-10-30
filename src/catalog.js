// Browse by engineering component class, with families for quick visual scanning.
// The category IDs are the stable `components.json` IDs; labels are UI-only.
/** @type {Record<string, string>} */
export const CATEGORY_IMAGE_MAP = {
  frame: '/images/Drone_frame.png',
  motor: '/images/Motor.png',
  prop: '/images/Prop.png',
  esc: '/images/ESC.png',
  fc: '/images/FC.png',
  gps: '/images/GPS.png',
  receiver: '/images/TX_RX.png',
  battery: '/images/Battery.png',
  power: '/images/Charge.png',
};

export const CATALOG_FAMILIES=[
  {name:'AIRFRAME',categories:[{id:'frame',label:'Drone Frames',description:'Khung và điểm lắp'}]},
  {name:'PROPULSION',categories:[
    {id:'motor',label:'Motors',description:'Động cơ brushless'},
    {id:'prop',label:'Propellers',description:'Cánh quạt'},
    {id:'esc',label:'ESCs',description:'Điều tốc'}]},
  {name:'FLIGHT & NAVIGATION',categories:[
    {id:'fc',label:'Flight Controllers',description:'Bộ điều khiển bay'},
    {id:'gps',label:'GPS & Navigation',description:'Định vị và la bàn'},
    {id:'receiver',label:'Receivers',description:'Thiết bị nhận tín hiệu'}]},
  {name:'POWER SYSTEM',categories:[
    {id:'battery',label:'Batteries',description:'Pin LiPo / nguồn năng lượng'},
    {id:'power',label:'Power Modules',description:'Module chuyển đổi nguồn'}]}
];
export const CATALOG_CATEGORIES=CATALOG_FAMILIES.flatMap(f=>f.categories);

export function filterCatalog(parts,activeCategory='all',search=''){
  const query=search.trim().toLowerCase();
  return parts.filter(c=>{
    if(activeCategory!=='all'&&c.category!==activeCategory)return false;
    const meta=CATALOG_CATEGORIES.find(x=>x.id===c.category);
    return `${c.name} ${c.subtitle} ${c.category} ${meta?.label||''} ${meta?.description||''}`.toLowerCase().includes(query);
  });
}
