// Organization details (taken from https://jucbank.com.np/)
export const SITE = {
  nameNp: 'जनउत्थान सामुदायिक लघुवित्त बित्तीय संस्था लि.',
  shortNp: 'जनउत्थान सामुदायिक लघुवित्त',
  nameEn: 'Janautthan Samudayic Laghubitta Bittiya Sanstha Ltd.',
  tagline: "नेपाल राष्ट्र बैंकबाट 'घ' वर्गको इजाजत प्राप्त (१९ जिल्ला कार्यक्षेत्र भएको)",
  official: 'https://jucbank.com.np',
  logo: 'https://jucbank.com.np/public/storage/settings/September2020/ligo5NXNwn0dQRSKKUMM.png',
  address: 'बुटवल-१०, कालिकाचोक, रुपन्देही',
  addressEn: 'Butwal-10, Kalikachowk, Rupandehi',
  phone: '071-438171',
  fax: '071-438169',
  email: 'info@jucbank.com.np',
  facebook: 'https://www.facebook.com/jucbankltd',
  youtube: 'https://www.youtube.com/@Jslbsl/videos',
  tiktok: 'https://www.tiktok.com/@janautthan',
};

export const CATEGORIES = ['समाचार', 'सूचना', 'कार्यक्रम'];

export const SERVICES = [
  { icon: '💰', title: 'बचत योजना', en: 'Saving Scheme', href: 'https://jucbank.com.np/pages/saving-scheme', text: 'ग्राहकलाई बचत गर्न प्रोत्साहन गर्ने विभिन्न बचत योजनाहरू।' },
  { icon: '🌱', title: 'ऋण योजना', en: 'Loan Scheme', href: 'https://jucbank.com.np/pages/loan-scheme', text: 'उद्यम तथा आयमूलक कार्यका लागि सहज ऋण सुविधा।' },
  { icon: '🌍', title: 'रेमिट्यान्स', en: 'Remittance', href: 'https://jucbank.com.np/pages/remittance-service', text: 'सुरक्षित र छिटो रेमिट्यान्स सेवा।' },
  { icon: '🛡️', title: 'बीमा', en: 'Insurance', href: 'https://jucbank.com.np/pages/insurance-service', text: 'परिवार र व्यवसायको सुरक्षाका लागि बीमा योजना।' },
];

export const LINKS = [
  { label: 'नेपाल राष्ट्र बैंक', href: 'https://www.nrb.org.np' },
  { label: 'NRB गुनासो पोर्टल', href: 'https://gunaso.nrb.org.np/' },
  { label: 'अर्थ मन्त्रालय', href: 'https://www.mof.gov.np' },
  { label: 'धितोपत्र बोर्ड (SEBON)', href: 'https://www.sebon.gov.np/' },
];

export function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function excerpt(text = '', n = 140) {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
}
