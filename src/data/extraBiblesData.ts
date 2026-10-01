import { BibleVerse, BibleVersionId } from '../types';

/**
 * Rich offline scripture store for extra Bible translations:
 * WEB (World English Bible), ASV (American Standard Version), BBE (Bible in Basic English),
 * LUO (Dholuo Muma Maler), LUG (Luganda Baibuli), and additional KJV/SUV/GIK chapters.
 */
export const EXTRA_BIBLES_STORE: Partial<Record<BibleVersionId, Record<string, BibleVerse[]>>> = {
  // ==========================================
  // WEB: WORLD ENGLISH BIBLE (100% Public Domain)
  // ==========================================
  WEB: {
    'John 1': [
      { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 2, text: 'The same was in the beginning with God.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 3, text: 'All things were made through him. Without him was not anything made that has been made.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 4, text: 'In him was life, and the life was the light of men.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 5, text: 'The light shines in the darkness, and the darkness hasn’t overcome it.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 14, text: 'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 16, text: 'From his fullness we all received grace upon grace.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 17, text: 'For the law was given through Moses. Grace and truth came through Jesus Christ.', isRedLetter: false },
    ],
    'John 3': [
      { book: 'John', chapter: 3, verse: 1, text: 'Now there was a man of the Pharisees named Nicodemus, a ruler of the Jews.', isRedLetter: false },
      { book: 'John', chapter: 3, verse: 3, text: 'Jesus answered him, “Most certainly, I tell you, unless one is born anew, he can’t see God’s Kingdom.”', isRedLetter: true },
      { book: 'John', chapter: 3, verse: 5, text: 'Jesus answered, “Most certainly I tell you, unless one is born of water and spirit, he can’t enter into God’s Kingdom.”', isRedLetter: true },
      { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.', isRedLetter: true },
      { book: 'John', chapter: 3, verse: 17, text: 'For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.', isRedLetter: true },
    ],
    'John 14': [
      { book: 'John', chapter: 14, verse: 1, text: '“Don’t let your heart be troubled. Believe in God. Believe also in me.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 2, text: 'In my Father’s house are many homes. If it weren’t so, I would have told you. I am going to prepare a place for you.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 3, text: 'If I go and prepare a place for you, I will come again, and will receive you to myself; that where I am, you may be there also.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 6, text: 'Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father, except through me.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 15, text: 'If you love me, keep my commandments.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 27, text: 'Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful.', isRedLetter: true },
    ],
    'Psalms 23': [
      { book: 'Psalms', chapter: 23, verse: 1, text: 'Yahweh is my shepherd: I shall lack nothing.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.', isRedLetter: false },
    ],
    'Psalm 23': [
      { book: 'Psalm', chapter: 23, verse: 1, text: 'Yahweh is my shepherd: I shall lack nothing.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 6, text: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.', isRedLetter: false },
    ],
    'Exodus 20': [
      { book: 'Exodus', chapter: 20, verse: 1, text: 'God spoke all these words, saying,', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 2, text: '“I am Yahweh your God, who brought you out of the land of Egypt, out of the house of bondage.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 3, text: 'You shall have no other gods before me.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 4, text: 'You shall not make for yourselves an idol, nor any image of anything that is in the heavens above, or that is in the earth beneath, or that is in the water under the earth.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 8, text: '“Remember the Sabbath day, to keep it holy.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 9, text: 'Six days you shall labor, and do all your work,', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 10, text: 'but the seventh day is a Sabbath to Yahweh your God. You shall not do any work in it, you, nor your son, nor your daughter, your male servant, nor your female servant, nor your livestock, nor your stranger who is within your gates;', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 11, text: 'for in six days Yahweh made heaven and earth, the sea, and all that is in them, and rested the seventh day; therefore Yahweh blessed the Sabbath day, and made it holy.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 12, text: '“Honor your father and your mother, that your days may be long in the land which Yahweh your God gives you.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 13, text: '“You shall not murder.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 14, text: '“You shall not commit adultery.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 15, text: '“You shall not steal.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 16, text: '“You shall not give false testimony against your neighbor.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 17, text: '“You shall not covet your neighbor’s house. You shall not covet your neighbor’s wife, nor his male servant, nor his female servant, nor his ox, nor his donkey, nor anything that is your neighbor’s.”', isRedLetter: false },
    ],
    'Revelation 14': [
      { book: 'Revelation', chapter: 14, verse: 6, text: 'I saw an angel flying in mid heaven, having an eternal Good News to proclaim to those who dwell on the earth, and to every nation, tribe, language, and people.', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 7, text: 'He said with a loud voice, “Fear the Lord, and give him glory; for the hour of his judgment has come. Worship him who made the heaven, the earth, the sea, and the springs of waters!”', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 8, text: 'Another, a second angel, followed, saying, “Babylon the great has fallen, which has made all the nations to drink of the wine of the wrath of her sexual immorality.”', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 9, text: 'Another angel, a third, followed them, saying with a great voice, “If anyone worships the beast and his image, and receives a mark on his forehead, or on his hand,', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 12, text: 'Here is the perseverance of the saints, those who keep the commandments of God, and the faith of Jesus.”', isRedLetter: false },
    ],
    '1 Corinthians 13': [
      { book: '1 Corinthians', chapter: 13, verse: 1, text: 'If I speak with the languages of men and of angels, but don’t have love, I have become sounding brass, or a clanging cymbal.', isRedLetter: false },
      { book: '1 Corinthians', chapter: 13, verse: 4, text: 'Love is patient and is kind. Love doesn’t envy. Love doesn’t brag, is not proud,', isRedLetter: false },
      { book: '1 Corinthians', chapter: 13, verse: 8, text: 'Love never fails. But where there are prophecies, they will be done away with. Where there are various languages, they will cease. Where there is knowledge, it will be done away with.', isRedLetter: false },
      { book: '1 Corinthians', chapter: 13, verse: 13, text: 'Now faith, hope, and love remain—these three. The greatest of these is love.', isRedLetter: false },
    ],
  },

  // ==========================================
  // ASV: AMERICAN STANDARD VERSION (1901)
  // ==========================================
  ASV: {
    'John 1': [
      { book: 'John', chapter: 1, verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 2, text: 'The same was in the beginning with God.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 3, text: 'All things were made through him; and without him was not anything made that hath been made.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 4, text: 'In him was life; and the life was the light of men.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 14, text: 'And the Word became flesh, and dwelt among us (and we beheld his glory, glory as of the only begotten from the Father), full of grace and truth.', isRedLetter: false },
    ],
    'Psalms 23': [
      { book: 'Psalms', chapter: 23, verse: 1, text: 'Jehovah is my shepherd; I shall not want.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures; He leadeth me beside still waters.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 3, text: 'He restoreth my soul: He guideth me in the paths of righteousness for his name’s sake.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Surely goodness and lovingkindness shall follow me all the days of my life; And I shall dwell in the house of Jehovah for ever.', isRedLetter: false },
    ],
    'Psalm 23': [
      { book: 'Psalm', chapter: 23, verse: 1, text: 'Jehovah is my shepherd; I shall not want.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 2, text: 'He maketh me to lie down in green pastures; He leadeth me beside still waters.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 3, text: 'He restoreth my soul: He guideth me in the paths of righteousness for his name’s sake.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil; for thou art with me; Thy rod and thy staff, they comfort me.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 6, text: 'Surely goodness and lovingkindness shall follow me all the days of my life; And I shall dwell in the house of Jehovah for ever.', isRedLetter: false },
    ],
    'Exodus 20': [
      { book: 'Exodus', chapter: 20, verse: 1, text: 'And God spake all these words, saying,', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 2, text: 'I am Jehovah thy God, who brought thee out of the land of Egypt, out of the house of bondage.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 8, text: 'Remember the sabbath day, to keep it holy.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 11, text: 'for in six days Jehovah made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore Jehovah blessed the sabbath day, and hallowed it.', isRedLetter: false },
    ],
    'Revelation 14': [
      { book: 'Revelation', chapter: 14, verse: 6, text: 'And I saw another angel flying in mid heaven, having eternal good tidings to proclaim unto them that dwell on the earth, and unto every nation and tribe and tongue and people;', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 7, text: 'and he saith with a great voice, Fear God, and give him glory; for the hour of his judgment is come: and worship him that made the heaven and the earth and sea and fountains of waters.', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 12, text: 'Here is the patience of the saints, they that keep the commandments of God, and the faith of Jesus.', isRedLetter: false },
    ],
  },

  // ==========================================
  // BBE: BIBLE IN BASIC ENGLISH
  // ==========================================
  BBE: {
    'John 1': [
      { book: 'John', chapter: 1, verse: 1, text: 'From the first he was the Word, and the Word was in relation with God and was God.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 3, text: 'God made all things through him, and without him was not anything made that has been made.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 4, text: 'In him was life; and the life was the light of men.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 14, text: 'And so the Word became flesh and took a place among us for a time; and we saw his glory, full of grace and true knowledge.', isRedLetter: false },
    ],
    'Psalms 23': [
      { book: 'Psalms', chapter: 23, verse: 1, text: 'The Lord is the keeper of my sheep; I will not be in need.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'He makes a resting-place for me in the green fields: he is my guide by the quiet waters.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 3, text: 'He gives new life to my soul: he is my guide in the ways of righteousness because of his name.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Yes, though I go through the valley of the deep shadow of death, I will have no fear of evil; for you are with me: your rod and your support are my comfort.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Truly, good and mercy will be with me all the days of my life: and I will have a place in the house of the Lord for ever.', isRedLetter: false },
    ],
    'Psalm 23': [
      { book: 'Psalm', chapter: 23, verse: 1, text: 'The Lord is the keeper of my sheep; I will not be in need.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 2, text: 'He makes a resting-place for me in the green fields: he is my guide by the quiet waters.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 3, text: 'He gives new life to my soul: he is my guide in the ways of righteousness because of his name.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 4, text: 'Yes, though I go through the valley of the deep shadow of death, I will have no fear of evil; for you are with me: your rod and your support are my comfort.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 6, text: 'Truly, good and mercy will be with me all the days of my life: and I will have a place in the house of the Lord for ever.', isRedLetter: false },
    ],
    'Exodus 20': [
      { book: 'Exodus', chapter: 20, verse: 1, text: 'And God said all these words:', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 8, text: 'Keep in memory the Sabbath day, to keep it holy.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 10, text: 'But the seventh day is a Sabbath to the Lord your God; on that day you are to do no work.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 11, text: 'For in six days the Lord made heaven and earth, the sea, and everything in them, and he took his rest on the seventh day: for this reason the Lord gave his blessing to the seventh day and made it holy.', isRedLetter: false },
    ],
    'Revelation 14': [
      { book: 'Revelation', chapter: 14, verse: 6, text: 'And I saw another angel flying in the middle of heaven, having an eternal gospel to preach to those on the earth, and to every nation and tribe and language and people;', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 7, text: 'Saying with a loud voice, Have fear of God and give him glory; for the hour of his judging is come: and give worship to him who made heaven and earth and sea and fountains of water.', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 12, text: 'Here is the quiet strength of the saints, who keep the orders of God, and the faith of Jesus.', isRedLetter: false },
    ],
  },

  // ==========================================
  // LUO: DHOLUO (Muma Maler - Kenya & Tanzania)
  // ==========================================
  LUO: {
    'Chakruok 1': [
      { book: 'Chakruok', chapter: 1, verse: 1, text: 'E chakruok Nyasaye nochweyo polo gi piny.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 2, text: 'Piny ne onge gi kido, kendo nono; mudho ne nitie e wi aora maduong\'; kendo Roho mar Nyasaye ne wuotho e wi pi.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 3, text: 'Nyasaye nowacho niya, “Ler mondo obedie,” mi ler nobedie.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 4, text: 'Nyasaye noneno ler ni ber; mi Nyasaye nopogo ler gi mudho.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 5, text: 'Nyasaye noluongo ler ni Okinyi, to mudho noluongo ni Otieno. Mi ne nitie odhiambo gi okinyi, odiechieng\' mokwongo.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 26, text: 'Nyasaye nowacho niya, “Wachweyuru dhano e kidowa, mana kaka wan, mondo gilo rech manie nam, gi winy manie kor polo, gi jamni, gi piny duto.”', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 27, text: 'Omiyo Nyasaye nochweyo dhano e kite owuon; e kido mar Nyasaye nochweyoe; dichwo gi dhako nochweyogi.', isRedLetter: false },
      { book: 'Chakruok', chapter: 1, verse: 31, text: 'Nyasaye noneno gik moko duto mosechweyo, kendo ne gibeyo ahinya. Odhiambo gi okinyi nobedie, odiechieng\' mar auchiel.', isRedLetter: false },
    ],
    'Genesis 1': [
      { book: 'Genesis', chapter: 1, verse: 1, text: 'E chakruok Nyasaye nochweyo polo gi piny.', isRedLetter: false },
      { book: 'Genesis', chapter: 1, verse: 3, text: 'Nyasaye nowacho niya, “Ler mondo obedie,” mi ler nobedie.', isRedLetter: false },
      { book: 'Genesis', chapter: 1, verse: 27, text: 'Omiyo Nyasaye nochweyo dhano e kite owuon; e kido mar Nyasaye nochweyoe; dichwo gi dhako nochweyogi.', isRedLetter: false },
    ],
    'Wuok 20': [
      { book: 'Wuok', chapter: 20, verse: 1, text: 'Nyasaye nowacho wechegi duto niya,', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 2, text: '“An e Jehova Nyasachi, mane ogoli e piny Misri, e od wasumbini.', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 3, text: 'Kik ibed gi nyiseche mamoko e nyima.', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 8, text: 'Par odiechieng\' Sabato mondo irite motur (maler).', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 9, text: 'Ndieche auchiel initiyi kendo initim tiji duto;', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 10, text: 'to odiechieng\' mar abiriyo en Sabato mar Jehova Nyasachi: e odiechiengno kik itim tich moro amora, in kata wuodi kata nyari kata jatichni.', isRedLetter: false },
      { book: 'Wuok', chapter: 20, verse: 11, text: 'Nimar kuom ndieche auchiel Jehova nochweyo polo gi piny, gi nam, gi gik moko duto manie iye, mi noyue e chieng\' mar abiriyo; emomiyo Jehova nogwedho odiechieng\' Sabato mi nokete maler.', isRedLetter: false },
    ],
    'Exodus 20': [
      { book: 'Exodus', chapter: 20, verse: 8, text: 'Par odiechieng\' Sabato mondo irite motur (maler).', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 11, text: 'Nimar kuom ndieche auchiel Jehova nochweyo polo gi piny, gi nam, gi gik moko duto manie iye, mi noyue e chieng\' mar abiriyo; emomiyo Jehova nogwedho odiechieng\' Sabato mi nokete maler.', isRedLetter: false },
    ],
    'Zaburi 23': [
      { book: 'Zaburi', chapter: 23, verse: 1, text: 'Jehova e jakwathna; aok nabedi jachan.', isRedLetter: false },
      { book: 'Zaburi', chapter: 23, verse: 2, text: 'Omiya ayueyo e lum mang\'ich; otera kuom pige moweyo ratiro.', isRedLetter: false },
      { book: 'Zaburi', chapter: 23, verse: 3, text: 'Odwoko chunya; otaya e yore mag kare nikech nyinge.', isRedLetter: false },
      { book: 'Zaburi', chapter: 23, verse: 4, text: 'Kata akalo e holo mar tipo mar tho, aok naluor gimoro marach: nimar in koda; ludhi gi thirni emomiyo ahwe.', isRedLetter: false },
      { book: 'Zaburi', chapter: 23, verse: 5, text: 'Iikona mesa e nyim wasika; iwiya gi mo; ohowo mara opong\' omol.', isRedLetter: false },
      { book: 'Zaburi', chapter: 23, verse: 6, text: 'Adier ng\'wono gi ber noluwa ndalo duto mag ngimana: kendo nabed e od Jehova nyaka chieng\'.', isRedLetter: false },
    ],
    'Psalms 23': [
      { book: 'Psalms', chapter: 23, verse: 1, text: 'Jehova e jakwathna; aok nabedi jachan.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 2, text: 'Omiya ayueyo e lum mang\'ich; otera kuom pige moweyo ratiro.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Kata akalo e holo mar tipo mar tho, aok naluor gimoro marach: nimar in koda; ludhi gi thirni emomiyo ahwe.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Adier ng\'wono gi ber noluwa ndalo duto mag ngimana: kendo nabed e od Jehova nyaka chieng\'.', isRedLetter: false },
    ],
    'Psalm 23': [
      { book: 'Psalm', chapter: 23, verse: 1, text: 'Jehova e jakwathna; aok nabedi jachan.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 4, text: 'Kata akalo e holo mar tipo mar tho, aok naluor gimoro marach: nimar in koda; ludhi gi thirni emomiyo ahwe.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 6, text: 'Adier ng\'wono gi ber noluwa ndalo duto mag ngimana: kendo nabed e od Jehova nyaka chieng\'.', isRedLetter: false },
    ],
    'Johana 1': [
      { book: 'Johana', chapter: 1, verse: 1, text: 'E chakruok Wach ne nitie, kendo Wach ne ni gi Nyasaye, kendo Wach ne en Nyasaye.', isRedLetter: false },
      { book: 'Johana', chapter: 1, verse: 2, text: 'E chakruok ne en gi Nyasaye.', isRedLetter: false },
      { book: 'Johana', chapter: 1, verse: 3, text: 'Gik moko duto nochwe kuome; to maonge en onge gimoro amora mane ochwe.', isRedLetter: false },
      { book: 'Johana', chapter: 1, verse: 4, text: 'Kuome ne nitie ngima; kendo ngimano ne en ler mar dhano.', isRedLetter: false },
      { book: 'Johana', chapter: 1, verse: 14, text: 'Kendo Wach noloko dende mi nodak e kindwa, (kendo ne waneno duonge, duong\' kaka mar Wuod Miyo Miderma mar Wuoro,) opong\' gi ng\'wono gi adiera.', isRedLetter: false },
    ],
    'John 1': [
      { book: 'John', chapter: 1, verse: 1, text: 'E chakruok Wach ne nitie, kendo Wach ne ni gi Nyasaye, kendo Wach ne en Nyasaye.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 14, text: 'Kendo Wach noloko dende mi nodak e kindwa, opong\' gi ng\'wono gi adiera.', isRedLetter: false },
    ],
    'Johana 14': [
      { book: 'Johana', chapter: 14, verse: 1, text: '“Chunyruok kik chandru; yieuru kuom Nyasaye, kendo yieuru bende kuoma.', isRedLetter: true },
      { book: 'Johana', chapter: 14, verse: 2, text: 'E od Wuora udi ng\'eny; kapo ni ne ok kamano, dine awachonu; nimar adhi ikonu kar dak.', isRedLetter: true },
      { book: 'Johana', chapter: 14, verse: 3, text: 'Kendo ka adhi ikonu kar dak, naduogi mi naruaku kuoma awuon; mondo kama antie, un bende ubedie.', isRedLetter: true },
      { book: 'Johana', chapter: 14, verse: 6, text: 'Yesu nowachone niya, “An e yo, gi adiera, gi ngima: onge ng\'at mobiro ir Wuoro, makmana kuoma.', isRedLetter: true },
      { book: 'Johana', chapter: 14, verse: 27, text: 'Kuwe aweyonu; kuwe mara amiyou; ok amiyou kaka piny miyou. Chunyruok kik chandru, kendo kik oluor.”', isRedLetter: true },
    ],
    'John 14': [
      { book: 'John', chapter: 14, verse: 1, text: '“Chunyruok kik chandru; yieuru kuom Nyasaye, kendo yieuru bende kuoma.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 6, text: 'Yesu nowachone niya, “An e yo, gi adiera, gi ngima: onge ng\'at mobiro ir Wuoro, makmana kuoma.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 27, text: 'Kuwe aweyonu; kuwe mara amiyou; ok amiyou kaka piny miyou.”', isRedLetter: true },
    ],
    'Fweny 14': [
      { book: 'Fweny', chapter: 14, verse: 6, text: 'Mi naneno malaika machielo kofuyo e kor polo, koting\'o Injili mar nyaka chieng\' me lando ne joma odak e piny, gi ne ogendini duto gi dhot duto gi dhok duto gi ji duto,', isRedLetter: false },
      { book: 'Fweny', chapter: 14, verse: 7, text: 'koolo gi dwol maduong\' niya, “Luoruru Nyasaye, kendo miyeuru duong\'; nimar seche mar bura mare ochopo: kendo lameuru Jal mane ochweyo polo gi piny gi nam gi sokni mag pi.”', isRedLetter: false },
      { book: 'Fweny', chapter: 14, verse: 8, text: 'Malaika machielo, mar ariyo, noluwo koliyo, “Obore, Babulon maduong\' osechore, mane omiyo ogendini duto omodho divai mar mirima mar terruok mare!”', isRedLetter: false },
      { book: 'Fweny', chapter: 14, verse: 12, text: 'Kae e kama sinani mar jo-maler nitie, joma rito chik mag Nyasaye, gi yie mar Yesu.', isRedLetter: false },
    ],
    'Revelation 14': [
      { book: 'Revelation', chapter: 14, verse: 6, text: 'Mi naneno malaika machielo kofuyo e kor polo, koting\'o Injili mar nyaka chieng\' me lando ne joma odak e piny.', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 7, text: 'koolo gi dwol maduong\' niya, “Luoruru Nyasaye, kendo miyeuru duong\'; nimar seche mar bura mare ochopo.”', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 12, text: 'Kae e kama sinani mar jo-maler nitie, joma rito chik mag Nyasaye, gi yie mar Yesu.', isRedLetter: false },
    ],
  },

  // ==========================================
  // LUG: LUGANDA (Baibuli Ey'Oluganda - Uganda)
  // ==========================================
  LUG: {
    'Olubereberye 1': [
      { book: 'Olubereberye', chapter: 1, verse: 1, text: 'Ku lubereberye Katonda yatonda eggulu n’ensi.', isRedLetter: false },
      { book: 'Olubereberye', chapter: 1, verse: 2, text: 'Ensi yali ngalo era nga njereere; n’ekizikiza kyali ku buziba: n’Omwoyo gwa Katonda yali ng’abuulira ku madzi.', isRedLetter: false },
      { book: 'Olubereberye', chapter: 1, verse: 3, text: 'Katonda n’ayogera nti, “Wabeewo omusana,” omusana ne gubaawo.', isRedLetter: false },
      { book: 'Olubereberye', chapter: 1, verse: 4, text: 'Katonda n’alaba omusana nga mulungi: Katonda n’awula omusana ku kizikiza.', isRedLetter: false },
      { book: 'Olubereberye', chapter: 1, verse: 27, text: 'Katonda n’atonda omuntu mu kifaananyi kye ye; mu kifaananyi kya Katonda mwe yamutondera; omusajja n’omukazi mwe yabatondera.', isRedLetter: false },
      { book: 'Olubereberye', chapter: 1, verse: 31, text: 'Katonda n’alaba buli kintu kye yakola, era, laba, kyali kirungi nnyo. Ne buwungeera ne bukya, olunaku olw’omukaaga.', isRedLetter: false },
    ],
    'Genesis 1': [
      { book: 'Genesis', chapter: 1, verse: 1, text: 'Ku lubereberye Katonda yatonda eggulu n’ensi.', isRedLetter: false },
      { book: 'Genesis', chapter: 1, verse: 3, text: 'Katonda n’ayogera nti, “Wabeewo omusana,” omusana ne gubaawo.', isRedLetter: false },
      { book: 'Genesis', chapter: 1, verse: 27, text: 'Katonda n’atonda omuntu mu kifaananyi kye ye; omusajja n’omukazi mwe yabatondera.', isRedLetter: false },
    ],
    'Okuva 20': [
      { book: 'Okuva', chapter: 20, verse: 1, text: 'Katonda n’ayogera ebigambo bino byonna nti,', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 2, text: '“Nze MUKAMA Katonda wo eyakuggya mu nsi y’e Misiri, mu nnyumba ey’obuddu.', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 3, text: 'Tobaanga na bakatonda balala mu maaso gange.', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 8, text: 'Ojjukiranga olunaku olwa Ssabbiiti olutukuzenga.', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 9, text: 'Ennaku omukaaga z’onookolerangamu, n’onookolangamu emirimu gyo gyonna:', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 10, text: 'naye olunaku olw’omusanvu lwe Ssabbiiti ya MUKAMA Katonda wo: tolukolerangako mulimu gwo gwonna, ggwe n’omwana wo ow’obulenzi n’ow’obuwala.', isRedLetter: false },
      { book: 'Okuva', chapter: 20, verse: 11, text: 'Kubanga mu nnaku omukaaga MUKAMA mwe yakolera eggulu n’ensi, ennyanja, na byonna ebibirimu, n’awummulira ku lunaku olw’omusanvu: MUKAMA kyeyava awa omukisa olunaku olwa Ssabbiiti, n’alutukuza.', isRedLetter: false },
    ],
    'Exodus 20': [
      { book: 'Exodus', chapter: 20, verse: 8, text: 'Ojjukiranga olunaku olwa Ssabbiiti olutukuzenga.', isRedLetter: false },
      { book: 'Exodus', chapter: 20, verse: 11, text: 'Kubanga mu nnaku omukaaga MUKAMA mwe yakolera eggulu n’ensi, ennyanja, na byonna ebibirimu, n’awummulira ku lunaku olw’omusanvu: MUKAMA kyeyava awa omukisa olunaku olwa Ssabbiiti, n’alutukuza.', isRedLetter: false },
    ],
    'Zabbuli 23': [
      { book: 'Zabbuli', chapter: 23, verse: 1, text: 'MUKAMA ye musumba wange; siriina kye nja kwetaaga.', isRedLetter: false },
      { book: 'Zabbuli', chapter: 23, verse: 2, text: 'Angalamiza mu ddundiro ery’omuddo omuto: Annembeza ku mabbali g’amazzi amateefu.', isRedLetter: false },
      { book: 'Zabbuli', chapter: 23, verse: 3, text: 'Azzaamu emmeeme yange: Ankuza mu makubo ag’obutuukirivu olw’erinnya lye.', isRedLetter: false },
      { book: 'Zabbuli', chapter: 23, verse: 4, text: 'Weewaawo, newakubadde nga ntambulira mu kiwonvu eky’ekisiikirize eky’okufa, Siityenga kabi konna; kubanga ggwe oli nange; O muggo gwo n’oluga lwyo, bye binzisaamu amanyi.', isRedLetter: false },
      { book: 'Zabbuli', chapter: 23, verse: 5, text: 'Onteekerateekera emmeeza mu maaso g’abazigu bange: Osiiga amafuta ku mutwe gwange; Ekikopo kyange kiyiika.', isRedLetter: false },
      { book: 'Zabbuli', chapter: 23, verse: 6, text: 'Mazima obulungi n’okusaasira biringoberera ennaku zonna ez’obulamu bwange: Nange naatuulanga mu nnyumba ya MUKAMA emirembe n’emirembe.', isRedLetter: false },
    ],
    'Psalms 23': [
      { book: 'Psalms', chapter: 23, verse: 1, text: 'MUKAMA ye musumba wange; siriina kye nja kwetaaga.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 4, text: 'Weewaawo, newakubadde nga ntambulira mu kiwonvu eky’ekisiikirize eky’okufa, Siityenga kabi konna; kubanga ggwe oli nange.', isRedLetter: false },
      { book: 'Psalms', chapter: 23, verse: 6, text: 'Mazima obulungi n’okusaasira biringoberera ennaku zonna ez’obulamu bwange: Nange naatuulanga mu nnyumba ya MUKAMA emirembe n’emirembe.', isRedLetter: false },
    ],
    'Psalm 23': [
      { book: 'Psalm', chapter: 23, verse: 1, text: 'MUKAMA ye musumba wange; siriina kye nja kwetaaga.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 4, text: 'Weewaawo, newakubadde nga ntambulira mu kiwonvu eky’ekisiikirize eky’okufa, Siityenga kabi konna; kubanga ggwe oli nange.', isRedLetter: false },
      { book: 'Psalm', chapter: 23, verse: 6, text: 'Mazima obulungi n’okusaasira biringoberera ennaku zonna ez’obulamu bwange: Nange naatuulanga mu nnyumba ya MUKAMA emirembe n’emirembe.', isRedLetter: false },
    ],
    'Yokaana 1': [
      { book: 'Yokaana', chapter: 1, verse: 1, text: 'Ku lubereberye Kigambo yaliwo, era Kigambo yali eri Katonda, era Kigambo yali Katonda.', isRedLetter: false },
      { book: 'Yokaana', chapter: 1, verse: 2, text: 'Oyo yali eri Katonda ku lubereberye.', isRedLetter: false },
      { book: 'Yokaana', chapter: 1, verse: 3, text: 'Ebintu byonna byakolebwa ku bubwe; n’awaliye tewali kintu na kimu ekyakolebwa ekyakolebwa.', isRedLetter: false },
      { book: 'Yokaana', chapter: 1, verse: 4, text: 'Mu ye mwe mwali obulamu; n’obulamu bwe bwali omusana gw’abantu.', isRedLetter: false },
      { book: 'Yokaana', chapter: 1, verse: 14, text: 'Kigambo n’afuuka omubiri, n’abeera mu ffe (ne tulaba ekitiibwa kye, ekitiibwa ng’eky’omwana omu yekka eyafaanana Kitaawe), ng’ajjula ekisa n’amazima.', isRedLetter: false },
    ],
    'John 1': [
      { book: 'John', chapter: 1, verse: 1, text: 'Ku lubereberye Kigambo yaliwo, era Kigambo yali eri Katonda, era Kigambo yali Katonda.', isRedLetter: false },
      { book: 'John', chapter: 1, verse: 14, text: 'Kigambo n’afuuka omubiri, n’abeera mu ffe, ng’ajjula ekisa n’amazima.', isRedLetter: false },
    ],
    'Yokaana 14': [
      { book: 'Yokaana', chapter: 14, verse: 1, text: '“Emitima gyammwe tegwennyamikanga: mukkiriza Katonda, nange munzikirize.', isRedLetter: true },
      { book: 'Yokaana', chapter: 14, verse: 2, text: 'Mu nnyumba ya Kitange mulimu ebifo eby’okubeeramu bingi; singa tekyali bwe kityo nandibagambye; kubanga ŋŋenda kubateekerateekera ekifo.', isRedLetter: true },
      { book: 'Yokaana', chapter: 14, verse: 3, text: 'Era bwe nnaagenda okubateekerateekera ekifo, ndikomawo nate, ndibatwala gye ndi; nnyini gye ndi, nammwe mubeerenga eyo.', isRedLetter: true },
      { book: 'Yokaana', chapter: 14, verse: 6, text: 'Yesu n’amugamba nti, “Nze kkubo, n’amazima, n’obulamu: tewali ajja eri Kitange, wabula ng’ayita mu nze.', isRedLetter: true },
      { book: 'Yokaana', chapter: 14, verse: 27, text: 'Emirembe mbagirekera; emirembe gyange mbaguwa: si ng’ensi bw’ewa, nze bwe mbawa. Omutima gwammwe tegwennyamikanga, so tegutyinga.”', isRedLetter: true },
    ],
    'John 14': [
      { book: 'John', chapter: 14, verse: 1, text: '“Emitima gyammwe tegwennyamikanga: mukkiriza Katonda, nange munzikirize.', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 6, text: 'Yesu n’amugamba nti, “Nze kkubo, n’amazima, n’obulamu: tewali ajja eri Kitange, wabula ng’ayita mu nze.”', isRedLetter: true },
      { book: 'John', chapter: 14, verse: 27, text: 'Emirembe mbagirekera; emirembe gyange mbaguwa: si ng’ensi bw’ewa, nze bwe mbawa.”', isRedLetter: true },
    ],
    'Okubikkulirwa 14': [
      { book: 'Okubikkulirwa', chapter: 14, verse: 6, text: 'Awo ne ndaba malayika omulala ng’abuuka mu wakati mu ggulu, ng’alina enjiri ey’emirembe gyonna ey’okubuulira abo abaawangaalira ku nsi, ne buli ggwanga, n’ekika, n’olulimi, n’abantu,', isRedLetter: false },
      { book: 'Okubikkulirwa', chapter: 14, verse: 7, text: 'ng’ayogera n’eddoboozi ddene nti, “Mutyenga Katonda, mumuwenga ekitiibwa; kubanga ekiseera eky’omusango gwe kituuse: musinzenga eyakola eggulu n’ensi n’ennyanja n’ensulo ez’amazzi.”', isRedLetter: false },
      { book: 'Okubikkulirwa', chapter: 14, verse: 8, text: 'Malayika omulala ow’okubiri n’amugoberera, ng’ayogera nti, “Agudde, agudde Babulooni ekinene, ekyanywesa amawanga gonna omwenge ogw’obusungu obw’obwenzi bwayo!”', isRedLetter: false },
      { book: 'Okubikkulirwa', chapter: 14, verse: 12, text: 'Wano we wali okugumiikiriza kw’abatukuvu, abo abakwata amateeka ga Katonda n’okukkiriza kwa Yesu.', isRedLetter: false },
    ],
    'Revelation 14': [
      { book: 'Revelation', chapter: 14, verse: 6, text: 'Awo ne ndaba malayika omulala ng’abuuka mu wakati mu ggulu, ng’alina enjiri ey’emirembe gyonna.', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 7, text: 'ng’ayogera n’eddoboozi ddene nti, “Mutyenga Katonda, mumuwenga ekitiibwa; kubanga ekiseera eky’omusango gwe kituuse.”', isRedLetter: false },
      { book: 'Revelation', chapter: 14, verse: 12, text: 'Wano we wali okugumiikiriza kw’abatukuvu, abo abakwata amateeka ga Katonda n’okukkiriza kwa Yesu.', isRedLetter: false },
    ],
  },
};
