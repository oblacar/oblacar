// src/seed/cargoOwnersPool.js
export const CARGO_OWNERS = [
  {
    ownerId: "f5uTdFZacmRrWZAVkkyskfmYpFn1",
    ownerName: "Станислав",
    ownerPhotoUrl: "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2Ff5uTdFZacmRrWZAVkkyskfmYpFn1?alt=media&token=5b02b47f-8718-44f8-915e-82ce3877b782",
    ownerRating: 4.9,
  },
  {
    ownerId: "4yFCj7s6pBTNsZnRs0Ek3pNUsYb2",
    ownerName: "Иван Геннадьевич",
    ownerPhotoUrl: "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2F4yFCj7s6pBTNsZnRs0Ek3pNUsYb2?alt=media&token=0a89c870-0e7f-4cf2-8915-382e70bbb5ff",
    ownerRating: "", // нет оценки
  },
  {
    ownerId: "A9lTs7ZeBsOHADGE1MGlFCKx08u1",
    ownerName: "Александр",
    ownerPhotoUrl: "https://firebasestorage.googleapis.com/v0/b/oblacar-7418d.appspot.com/o/profilePhotos%2FA9lTs7ZeBsOHADGE1MGlFCKx08u1?alt=media&token=07d75925-5ed9-4128-b681-49769c59de54",
    ownerRating: "", // нет оценки
  },
];

export function pickOwner() {
  const i = Math.floor(Math.random() * CARGO_OWNERS.length);
  return CARGO_OWNERS[i];
}
