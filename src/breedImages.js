const LOCAL_BREEDS = [
  'pitbull', 'rottweiler', 'german_shepherd', 'husky', 'labrador',
  'french_bulldog', 'pug', 'english_bulldog', 'doberman', 'border_collie',
];

const DOG_CEO_IMAGES = {
  akita: 'https://images.dog.ceo/breeds/akita/akita_hiking_in_shpella_e_pellumbasit.jpg',
  beagle: 'https://images.dog.ceo/breeds/beagle/n02088364_12405.jpg',
  boxer: 'https://images.dog.ceo/breeds/boxer/n02108089_2796.jpg',
  bull_terrier: 'https://images.dog.ceo/breeds/bullterrier-staffordshire/n02093256_1757.jpg',
  chihuahua: 'https://images.dog.ceo/breeds/chihuahua/n02085620_1321.jpg',
  chow_chow: 'https://images.dog.ceo/breeds/chow/n02112137_7991.jpg',
  cocker_spaniel: 'https://images.dog.ceo/breeds/spaniel-cocker/n02102318_8697.jpg',
  corgi: 'https://images.dog.ceo/breeds/corgi-cardigan/n02113186_4711.jpg',
  dachshund: 'https://images.dog.ceo/breeds/dachshund/dog-55140_640.jpg',
  dalmatian: 'https://images.dog.ceo/breeds/dalmatian/cooper1.jpg',
  eskimo_dog: 'https://images.dog.ceo/breeds/eskimo/n02109961_5772.jpg',
  golden_retriever: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_5452.jpg',
  great_dane: 'https://images.dog.ceo/breeds/dane-great/n02109047_26134.jpg',
  havanese: 'https://images.dog.ceo/breeds/havanese/00100trportrait_00100_burst20191112123933390_cover.jpg',
  malamute: 'https://images.dog.ceo/breeds/malamute/n02110063_18782.jpg',
  maltese: 'https://images.dog.ceo/breeds/maltese/n02085936_3678.jpg',
  miniature_pinscher: 'https://images.dog.ceo/breeds/pinscher-miniature/n02107312_6706.jpg',
  newfoundland: 'https://images.dog.ceo/breeds/newfoundland/n02111277_5168.jpg',
  papillon: 'https://images.dog.ceo/breeds/papillon/n02086910_5547.jpg',
  pekinese: 'https://images.dog.ceo/breeds/pekinese/n02086079_4412.jpg',
  pomeranian: 'https://images.dog.ceo/breeds/pomeranian/n02112018_3599.jpg',
  poodle: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_1696.jpg',
  puggle: 'https://images.dog.ceo/breeds/puggle/img_114654.jpg',
  samoyed: 'https://images.dog.ceo/breeds/samoyed/n02111889_10059.jpg',
  shiba_inu: 'https://images.dog.ceo/breeds/shiba/shiba-5.jpg',
  shih_tzu: 'https://images.dog.ceo/breeds/shihtzu/n02086240_3217.jpg',
  weimaraner: 'https://images.dog.ceo/breeds/weimaraner/n02092339_7468.jpg',
  west_highland: 'https://images.dog.ceo/breeds/terrier-westhighland/n02098286_758.jpg',
  whippet: 'https://images.dog.ceo/breeds/whippet/n02091134_7528.jpg',
  yorkshire_terrier: 'https://images.dog.ceo/breeds/terrier-yorkshire/n02094433_4248.jpg',
};

export const FALLBACK_IMAGE = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_6105.jpg';

export function getBreedImage(id) {
  if (!id) return FALLBACK_IMAGE;
  if (LOCAL_BREEDS.includes(id)) return `/images/${id}.jpg`;
  return DOG_CEO_IMAGES[id] || FALLBACK_IMAGE;
}