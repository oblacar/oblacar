// DebugFaIcons.jsx
import React from 'react';
import CargoTypeFaIcon from './CargoTypeFaIcon';

const test = [
  'строительные материалы','мебель','продукты','промтовары',
  'насыпной','наливной','ADR','прочее','охлажд.','заморозка','температура'
];

export default function DebugFaIcons() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(180px, 1fr))',gap:12}}>
      {test.map((t) => (
        <div key={t} style={{border:'1px solid #eee',borderRadius:8,padding:8,display:'flex',alignItems:'center',gap:10}}>
          <CargoTypeFaIcon type={t} size={22} />
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}
