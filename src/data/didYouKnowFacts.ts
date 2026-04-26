import type { LanguageCode } from "../i18n";

export type FactCountry = "China" | "Indonesia" | "United States of America" | "India";

export type DidYouKnowFact = {
  id: string;
  country: FactCountry;
  text_en: string;
  text_zh: string;
  text_id: string;
  text_hi: string;
};

export const didYouKnowFacts: DidYouKnowFact[] = [
  {
    id: "cn_01",
    country: "China",
    text_en: "A 4,000-year-old noodle bowl found in China is the oldest noodle evidence ever discovered.",
    text_zh: "在中国发现的一只 4000 年前的面碗，是目前已知最古老的面条证据。",
    text_id: "Mangkuk mi berusia 4.000 tahun yang ditemukan di Tiongkok adalah bukti mi tertua di dunia.",
    text_hi: "चीन में मिला 4,000 साल पुराना नूडल कटोरा दुनिया में नूडल्स का सबसे पुराना प्रमाण है।"
  },
  {
    id: "cn_02",
    country: "China",
    text_en: "Fortune cookies are not Chinese. They were popularized in California in the early 1900s.",
    text_zh: "幸运饼干并不是中国起源的，它是在 20 世纪初于美国加州流行起来的。",
    text_id: "Kue keberuntungan bukan berasal dari Tiongkok; makanan ini populer di California awal 1900-an.",
    text_hi: "फॉर्च्यून कुकी चीनी नहीं है; यह 1900 के शुरुआती दशक में कैलिफ़ोर्निया में लोकप्रिय हुई।"
  },
  {
    id: "cn_03",
    country: "China",
    text_en: "China has 8 major regional cuisines, each with its own ingredients, techniques, and flavors.",
    text_zh: "中国有八大菜系，每个菜系都有自己独特的食材、技法和风味。",
    text_id: "Tiongkok punya 8 tradisi kuliner besar, masing-masing dengan bahan, teknik, dan rasa yang berbeda.",
    text_hi: "चीन की 8 प्रमुख क्षेत्रीय रसोइयाँ हैं, और हर एक की सामग्री, तकनीक और स्वाद अलग हैं।"
  },
  {
    id: "cn_04",
    country: "China",
    text_en: "The wok was designed for fast cooking over scarce fuel, which is why stir-frying is so efficient.",
    text_zh: "炒锅最初是为节省燃料而设计的，这也是爆炒如此高效的原因。",
    text_id: "Wok dirancang untuk memasak cepat dengan bahan bakar terbatas, jadi tumis jadi sangat efisien.",
    text_hi: "वोक कम ईंधन में तेज़ खाना पकाने के लिए बना था, इसलिए स्टर-फ्राइ इतनी कुशल होती है।"
  },
  {
    id: "cn_05",
    country: "China",
    text_en: "China grows and eats more garlic than the rest of the world combined.",
    text_zh: "中国种植和食用的大蒜总量，比世界其他地区加起来还多。",
    text_id: "Tiongkok menanam dan mengonsumsi bawang putih lebih banyak daripada gabungan seluruh dunia lainnya.",
    text_hi: "चीन दुनिया के बाकी हिस्सों को मिलाकर भी उससे ज़्यादा लहसुन उगाता और खाता है।"
  },
  {
    id: "cn_06",
    country: "China",
    text_en: "Tea legends trace its discovery in China to Emperor Shen Nong around 2737 BC.",
    text_zh: "关于茶的传说常追溯到公元前 2737 年左右的中国神农时代。",
    text_id: "Legenda teh menelusuri penemuannya di Tiongkok hingga Kaisar Shen Nong sekitar 2737 SM.",
    text_hi: "चाय की प्रसिद्ध कथा इसकी खोज चीन में लगभग 2737 ईसा पूर्व सम्राट शेन नोंग से जोड़ती है।"
  },
  {
    id: "cn_07",
    country: "China",
    text_en: "Sichuan peppercorn creates a tingling 'ma' feeling. It is numbing, not spicy heat.",
    text_zh: "花椒带来的“麻”感并不是辣，而是一种发麻的刺刺感觉。",
    text_id: "Lada Sichuan memberi rasa 'ma' yang kesemutan. Itu mati rasa, bukan pedas panas.",
    text_hi: "सिचुआन पेपरकॉर्न का 'मा' एहसास तीखा नहीं, बल्कि झनझनाहट और सुन्नपन होता है।"
  },
  {
    id: "cn_08",
    country: "China",
    text_en: "Dim sum began as teahouse snacks and grew into hundreds of small dishes.",
    text_zh: "点心最初只是茶楼小食，后来逐渐发展成数百种精致小菜。",
    text_id: "Dim sum bermula sebagai kudapan rumah teh lalu berkembang menjadi ratusan hidangan kecil.",
    text_hi: "दिम सम की शुरुआत चायघरों के नाश्ते के रूप में हुई और वह सैकड़ों छोटे व्यंजनों तक बढ़ गया।"
  },
  {
    id: "cn_09",
    country: "China",
    text_en: "Peking duck dates back to the Yuan era and later became a favorite at imperial banquets.",
    text_zh: "北京烤鸭可以追溯到元代，后来还成为宫廷宴席上的名菜。",
    text_id: "Bebek Peking sudah ada sejak era Yuan dan kemudian jadi favorit jamuan kekaisaran.",
    text_hi: "पीकिंग डक का इतिहास युआन काल तक जाता है और बाद में यह शाही दावतों की पसंद बनी।"
  },
  {
    id: "cn_10",
    country: "China",
    text_en: "In Mandarin, the word for fish sounds like abundance, so fish is a New Year favorite.",
    text_zh: "在中文里“鱼”和“余”同音，所以鱼常常出现在春节餐桌上。",
    text_id: "Dalam Mandarin, kata ikan berbunyi seperti kelimpahan, jadi ikan populer saat Tahun Baru.",
    text_hi: "मंदारिन में 'मछली' का उच्चारण 'समृद्धि' जैसा लगता है, इसलिए नववर्ष पर मछली खास होती है।"
  },
  {
    id: "us_01",
    country: "United States of America",
    text_en: "Americans eat about 50 billion burgers a year, roughly three burgers per person each week.",
    text_zh: "美国人每年大约吃掉 500 亿个汉堡，平均每人每周差不多 3 个。",
    text_id: "Orang Amerika makan sekitar 50 miliar burger per tahun, kira-kira tiga burger per orang per minggu.",
    text_hi: "अमेरिका में हर साल लगभग 50 अरब बर्गर खाए जाते हैं, यानी प्रति व्यक्ति हर हफ्ते करीब 3 बर्गर।"
  },
  {
    id: "us_02",
    country: "United States of America",
    text_en: "Caesar salad was invented in Mexico by an Italian immigrant, not in Italy or the U.S.",
    text_zh: "凯撒沙拉其实是在墨西哥由一位意大利移民发明的，不是意大利也不是美国。",
    text_id: "Salad Caesar ditemukan di Meksiko oleh imigran Italia, bukan di Italia atau Amerika Serikat.",
    text_hi: "सीज़र सलाद इटली या अमेरिका में नहीं, बल्कि मेक्सिको में एक इतालवी प्रवासी ने बनाया था।"
  },
  {
    id: "us_03",
    country: "United States of America",
    text_en: "Buffalo wings were created in Buffalo, New York, in 1964 for hungry late-night guests.",
    text_zh: "水牛城辣鸡翅诞生于 1964 年纽约州布法罗，当时是为了招待深夜饥饿的客人。",
    text_id: "Sayap Buffalo dibuat di Buffalo, New York, pada 1964 untuk tamu malam yang lapar.",
    text_hi: "बफेलो विंग्स 1964 में न्यूयॉर्क के बफेलो शहर में देर रात भूखे मेहमानों के लिए बनाई गईं।"
  },
  {
    id: "us_04",
    country: "United States of America",
    text_en: "Ketchup was once marketed as medicine in the 1830s.",
    text_zh: "在 19 世纪 30 年代，番茄酱一度还被当作药物来出售。",
    text_id: "Kecap tomat pernah dipasarkan sebagai obat pada tahun 1830-an.",
    text_hi: "1830 के दशक में केचप को कभी दवा के रूप में भी बेचा जाता था।"
  },
  {
    id: "us_05",
    country: "United States of America",
    text_en: "The chocolate chip cookie was invented by accident in Massachusetts in 1938.",
    text_zh: "巧克力碎饼干是在 1938 年美国马萨诸塞州意外发明出来的。",
    text_id: "Kue chip cokelat ditemukan tanpa sengaja di Massachusetts pada 1938.",
    text_hi: "चॉकलेट चिप कुकी 1938 में मैसाचुसेट्स में गलती से बनी थी।"
  },
  {
    id: "us_06",
    country: "United States of America",
    text_en: "Americans eat around 1.4 billion chicken wings on Super Bowl Sunday alone.",
    text_zh: "仅超级碗那一天，美国人就会吃掉大约 14 亿只鸡翅。",
    text_id: "Orang Amerika memakan sekitar 1,4 miliar sayap ayam hanya pada hari Super Bowl.",
    text_hi: "सिर्फ सुपर बाउल संडे के दिन ही अमेरिकी लगभग 1.4 अरब चिकन विंग्स खाते हैं।"
  },
  {
    id: "us_07",
    country: "United States of America",
    text_en: "Apple pie is iconic in America, but the recipe roots came from Europe.",
    text_zh: "苹果派在美国很有代表性，但它的食谱根源其实来自欧洲。",
    text_id: "Pai apel memang ikonik di Amerika, tetapi akar resepnya berasal dari Eropa.",
    text_hi: "एप्पल पाई अमेरिका की पहचान है, लेकिन इसकी रेसिपी की जड़ें यूरोप से आई थीं।"
  },
  {
    id: "us_08",
    country: "United States of America",
    text_en: "Cornbread was a staple in Native American cooking long before colonization.",
    text_zh: "早在殖民时期之前，玉米面包就已经是美洲原住民的重要主食之一。",
    text_id: "Cornbread sudah menjadi makanan pokok dalam masakan penduduk asli Amerika jauh sebelum kolonisasi.",
    text_hi: "उपनिवेश से बहुत पहले कॉर्नब्रेड मूल अमेरिकी भोजन का प्रमुख हिस्सा था।"
  },
  {
    id: "us_09",
    country: "United States of America",
    text_en: "Cream cheese, key to New York cheesecake, was invented by accident in New York in 1872.",
    text_zh: "纽约芝士蛋糕的重要原料奶油芝士，是 1872 年在纽约意外发明的。",
    text_id: "Keju krim, kunci cheesecake New York, ditemukan tanpa sengaja di New York pada 1872.",
    text_hi: "न्यूयॉर्क चीज़केक की मुख्य सामग्री क्रीम चीज़ 1872 में न्यूयॉर्क में गलती से बनी थी।"
  },
  {
    id: "us_10",
    country: "United States of America",
    text_en: "The word barbecue likely comes from barbacoa, a Taíno word recorded in the Caribbean.",
    text_zh: "“Barbecue” 这个词很可能来自加勒比地区泰诺语中的 “barbacoa”。",
    text_id: "Kata barbecue kemungkinan berasal dari barbacoa, kata Taíno yang tercatat di Karibia.",
    text_hi: "'बारबेक्यू' शब्द संभवतः कैरेबियन की ताइनो भाषा के शब्द 'बारबाकोआ' से आया है।"
  },
  {
    id: "id_01",
    country: "Indonesia",
    text_en: "Rendang was once named the world's best food in a global CNN travel readers poll.",
    text_zh: "仁当曾在 CNN Travel 的全球读者票选中被评为“世界上最好吃的食物”之一。",
    text_id: "Rendang pernah dinobatkan sebagai makanan terbaik dunia dalam polling pembaca CNN Travel.",
    text_hi: "रेंदांग को कभी CNN Travel के वैश्विक पाठक सर्वे में दुनिया के सबसे पसंदीदा भोजन में चुना गया था।"
  },
  {
    id: "id_02",
    country: "Indonesia",
    text_en: "Barack Obama has said nasi goreng was one of his favorite foods from childhood in Indonesia.",
    text_zh: "奥巴马曾说，印尼童年时期最喜欢的食物之一就是炒饭。",
    text_id: "Barack Obama pernah bilang nasi goreng adalah salah satu makanan favorit masa kecilnya di Indonesia.",
    text_hi: "बराक ओबामा ने कहा था कि इंडोनेशिया में बचपन के उनके पसंदीदा खाने में नासी गोरेंग शामिल था।"
  },
  {
    id: "id_03",
    country: "Indonesia",
    text_en: "Indonesia stretches across more than 17,000 islands, which helps explain its huge food diversity.",
    text_zh: "印度尼西亚横跨 17000 多个岛屿，这也是它饮食文化极其多样的重要原因。",
    text_id: "Indonesia membentang di lebih dari 17.000 pulau, sebab besar mengapa kulinernya sangat beragam.",
    text_hi: "इंडोनेशिया 17,000 से अधिक द्वीपों में फैला है, इसलिए वहाँ के भोजन में अद्भुत विविधता है।"
  },
  {
    id: "id_04",
    country: "Indonesia",
    text_en: "Tempeh comes from Java and has been made for centuries using fermented soybeans.",
    text_zh: "天贝起源于爪哇，几个世纪以来一直以发酵大豆制成。",
    text_id: "Tempe berasal dari Jawa dan sudah dibuat selama berabad-abad dari kedelai fermentasi.",
    text_hi: "टेम्पे जावा से आया है और सदियों से किण्वित सोयाबीन से बनाया जाता रहा है।"
  },
  {
    id: "id_05",
    country: "Indonesia",
    text_en: "The spice trade made Indonesian cloves and nutmeg so valuable that empires fought for them.",
    text_zh: "香料贸易让印尼的丁香和肉豆蔻极为珍贵，甚至引发了列强之间的争夺。",
    text_id: "Perdagangan rempah membuat cengkih dan pala Indonesia sangat berharga hingga diperebutkan kerajaan.",
    text_hi: "मसाला व्यापार ने इंडोनेशियाई लौंग और जायफल को इतना मूल्यवान बनाया कि साम्राज्य उनके लिए लड़े।"
  },
  {
    id: "id_06",
    country: "Indonesia",
    text_en: "Indonesia has dozens of soto varieties, and many cooks say every region has its own style.",
    text_zh: "印尼有几十种不同的索托汤，很多人都说几乎每个地区都有自己的做法。",
    text_id: "Indonesia punya banyak sekali jenis soto, dan hampir tiap daerah memiliki gayanya sendiri.",
    text_hi: "इंडोनेशिया में सोटो के दर्जनों रूप हैं, और लगभग हर क्षेत्र की अपनी शैली मानी जाती है।"
  },
  {
    id: "id_07",
    country: "Indonesia",
    text_en: "Bakso became a street favorite because meatball carts made hot soup easy to sell anywhere.",
    text_zh: "肉丸汤之所以成为街头经典，很大程度上是因为推车贩卖让热汤能到处流动售卖。",
    text_id: "Bakso jadi favorit jalanan karena gerobak bakso membuat sup panas mudah dijual di mana saja.",
    text_hi: "बक्सो सड़क पर इसलिए इतना लोकप्रिय हुआ क्योंकि ठेलों से गरम सूप कहीं भी बेचना आसान था।"
  },
  {
    id: "id_08",
    country: "Indonesia",
    text_en: "Martabak in Indonesia evolved into sweet and savory versions that feel like two separate foods.",
    text_zh: "印尼的玛尔塔巴克发展出了甜口和咸口两个方向，几乎像是两种不同的食物。",
    text_id: "Martabak di Indonesia berkembang menjadi versi manis dan gurih yang terasa seperti dua makanan berbeda.",
    text_hi: "इंडोनेशिया में मार्तबाक मीठे और नमकीन दोनों रूपों में विकसित हुआ, मानो दो अलग व्यंजन हों।"
  },
  {
    id: "id_09",
    country: "Indonesia",
    text_en: "Kecap manis is an Indonesian sweet soy sauce, thicker and darker than many other soy sauces.",
    text_zh: "甜酱油是印尼特色酱料，比许多其他酱油更浓稠也更深色。",
    text_id: "Kecap manis adalah kecap manis khas Indonesia yang lebih kental dan gelap dari banyak kecap lain.",
    text_hi: "केचप मनिस इंडोनेशिया की मीठी सोया सॉस है, जो कई दूसरी सोया सॉस से अधिक गाढ़ी और गहरी होती है।"
  },
  {
    id: "id_10",
    country: "Indonesia",
    text_en: "Indomie became a global instant noodle icon, with fans and cafés far beyond Indonesia.",
    text_zh: "Indomie 已经成为全球知名的方便面品牌，在印尼之外也拥有大量粉丝和主题餐馆。",
    text_id: "Indomie menjadi ikon mi instan global dengan penggemar dan kafe jauh melampaui Indonesia.",
    text_hi: "इंडोमी एक वैश्विक इंस्टेंट नूडल आइकन बन चुका है, जिसके प्रशंसक इंडोनेशिया से बहुत दूर तक फैले हैं।"
  },
  {
    id: "in_01",
    country: "India",
    text_en: "Dal has been cooked on the Indian subcontinent for thousands of years and still anchors daily meals.",
    text_zh: "达尔豆汤在印度次大陆已经烹煮了数千年，至今仍是日常饮食的核心。",
    text_id: "Dal telah dimasak di anak benua India selama ribuan tahun dan tetap jadi inti makanan harian.",
    text_hi: "दाल भारतीय उपमहाद्वीप में हज़ारों साल से पकाई जा रही है और आज भी रोज़मर्रा के भोजन का आधार है।"
  },
  {
    id: "in_02",
    country: "India",
    text_en: "Butter chicken is widely said to have been created by accident in Delhi from leftover tandoori chicken.",
    text_zh: "黄油鸡常被认为是在德里意外诞生的，用的是剩下的坦都里鸡。",
    text_id: "Butter chicken dipercaya lahir tanpa sengaja di Delhi dari sisa ayam tandoori.",
    text_hi: "माना जाता है कि बटर चिकन दिल्ली में बची हुई तंदूरी चिकन से गलती से बना।"
  },
  {
    id: "in_03",
    country: "India",
    text_en: "Biryani is so loved that food apps in India report tens of millions of orders every year.",
    text_zh: "印度人对香饭的喜爱程度极高，外卖平台每年都记录到数以千万计的订单。",
    text_id: "Biryani sangat digemari hingga aplikasi makanan di India mencatat puluhan juta pesanan tiap tahun.",
    text_hi: "बिरयानी इतनी प्रिय है कि भारत की फ़ूड ऐप्स हर साल इसके करोड़ों ऑर्डर दर्ज करती हैं।"
  },
  {
    id: "in_04",
    country: "India",
    text_en: "The samosa likely traveled from Central Asia before becoming deeply Indian in flavor and filling.",
    text_zh: "萨摩萨很可能是从中亚传来的，后来才在印度发展出自己的风味和馅料。",
    text_id: "Samosa kemungkinan datang dari Asia Tengah sebelum menjadi sangat India dalam rasa dan isiannya.",
    text_hi: "समोसा संभवतः मध्य एशिया से आया, लेकिन स्वाद और भरावन में यह गहराई से भारतीय बन गया।"
  },
  {
    id: "in_05",
    country: "India",
    text_en: "Traditional paneer uses acid, not rennet, which is why it stays popular in many vegetarian kitchens.",
    text_zh: "传统奶酪用酸来凝固而不是凝乳酶，因此在很多素食厨房里特别常见。",
    text_id: "Paneer tradisional memakai asam, bukan rennet, sehingga populer di banyak dapur vegetarian.",
    text_hi: "पारंपरिक पनीर अम्ल से जमाया जाता है, रैनेट से नहीं, इसलिए यह शाकाहारी रसोइयों में लोकप्रिय है।"
  },
  {
    id: "in_06",
    country: "India",
    text_en: "India is the world's largest producer of chickpeas, a major ingredient in many regional dishes.",
    text_zh: "印度是世界上最大的鹰嘴豆生产国，而鹰嘴豆也是很多地区菜肴的重要原料。",
    text_id: "India adalah produsen buncis terbesar di dunia, bahan penting bagi banyak hidangan regional.",
    text_hi: "भारत दुनिया का सबसे बड़ा चना उत्पादक है, और चना अनेक क्षेत्रीय व्यंजनों का मुख्य हिस्सा है।"
  },
  {
    id: "in_07",
    country: "India",
    text_en: "Lassi appears in old Ayurvedic traditions as a cooling yogurt drink for digestion and balance.",
    text_zh: "拉昔在古老的阿育吠陀传统中就出现过，被视为帮助消化、带来平衡的清凉饮品。",
    text_id: "Lassi muncul dalam tradisi Ayurveda lama sebagai minuman yogurt yang menyejukkan dan membantu pencernaan.",
    text_hi: "लस्सी पुराने आयुर्वेदिक परंपराओं में पाचन और संतुलन के लिए ठंडक देने वाले पेय के रूप में मिलती है।"
  },
  {
    id: "in_08",
    country: "India",
    text_en: "Turmeric has been used in India for over 4,000 years in food, dyeing, and ceremony.",
    text_zh: "姜黄在印度已有 4000 多年的使用历史，不只做菜，也用于染色和仪式。",
    text_id: "Kunyit telah digunakan di India lebih dari 4.000 tahun untuk makanan, pewarnaan, dan upacara.",
    text_hi: "हल्दी भारत में 4,000 साल से अधिक समय से भोजन, रंगाई और अनुष्ठानों में उपयोग होती रही है।"
  },
  {
    id: "in_09",
    country: "India",
    text_en: "Many Indians do not call their food 'curry'. Specific dish names matter more than the umbrella word.",
    text_zh: "很多印度人并不会把自己的菜一概称作“咖喱”，具体菜名往往更重要。",
    text_id: "Banyak orang India tidak menyebut semua masakannya 'kari'; nama hidangan yang spesifik lebih penting.",
    text_hi: "बहुत से भारतीय अपने भोजन को बस 'करी' नहीं कहते; विशिष्ट पकवानों के नाम ज़्यादा मायने रखते हैं।"
  },
  {
    id: "in_10",
    country: "India",
    text_en: "Masala chai became more widespread under tea campaigns during British rule, then evolved locally.",
    text_zh: "香料奶茶在英属时期的茶叶推广下更广泛流行，随后又发展出了非常本地化的做法。",
    text_id: "Masala chai makin meluas lewat kampanye teh pada masa kolonial Inggris, lalu berkembang secara lokal.",
    text_hi: "ब्रिटिश शासन के दौरान चाय प्रचार अभियानों से मसाला चाय व्यापक हुई, फिर उसने स्थानीय रूप धारण किया।"
  }
];

export function getFactText(fact: DidYouKnowFact, language: LanguageCode) {
  const key = `text_${language}` as const;
  return fact[key] || fact.text_en;
}
