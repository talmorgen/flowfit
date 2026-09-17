export type ExerciseMetric = 'reps' | 'seconds' | 'distance' | 'mobility' | 'quality';

export type BankExercise = {
  id: string;
  name: string;
  aliases: string[];
  category: 'legs' | 'hinge' | 'pull' | 'push' | 'shoulders' | 'core' | 'power' | 'mobility' | 'carry';
  description: string;
  surfBenefit: string;
  equipment: string[];
  metric: ExerciseMetric;
  sets: number;
  reps: number;
  weight: number;
  gif?: string;
  source: 'curated' | 'coach' | 'user';
};

const exercise = (value: Omit<BankExercise, 'id' | 'aliases' | 'source'> & { id?: string; aliases?: string[]; source?: BankExercise['source'] }): BankExercise => ({
  ...value,
  id: value.id || value.name.toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, '-'),
  aliases: value.aliases || [],
  source: value.source || 'curated',
});

export const baseExerciseBank: BankExercise[] = [
  exercise({ name: 'גובלט סקוואט', aliases: ['Goblet Squat'], category: 'legs', description: 'סקוואט נגיש שמפתח רגליים, ליבה ויציבות.', surfBenefit: 'עמידה נמוכה ויציבה על הגלשן', equipment: ['דאמבל', 'קטלבל'], metric: 'reps', sets: 3, reps: 10, weight: 20, gif: 'yn8yg1r.gif' }),
  exercise({ name: 'סקוואט', aliases: ['Back Squat'], category: 'legs', description: 'כוח רגליים מלא תחת עומס.', surfBenefit: 'כוח קימה ושליטה בעמידה', equipment: ['מוט'], metric: 'reps', sets: 3, reps: 7, weight: 70, gif: 'qXTaZnJ.gif' }),
  exercise({ name: "לאנג׳ / ספליט סקוואט", aliases: ['Split Squat', 'Lunge'], category: 'legs', description: 'כוח חד־צדדי ושליטה בברך.', surfBenefit: 'יציבות אסימטרית בעמידה', equipment: ['דאמבלים'], metric: 'reps', sets: 3, reps: 10, weight: 10, gif: 'HBYyX94.gif' }),
  exercise({ name: 'בולגרי ספליט סקוואט', aliases: ['Bulgarian Split Squat'], category: 'legs', description: 'כוח חד־צדדי מתקדם עם טווח תנועה גדול.', surfBenefit: 'שליטה ברגל קדמית ואחורית', equipment: ['ספסל', 'דאמבלים'], metric: 'reps', sets: 3, reps: 8, weight: 12 }),
  exercise({ name: 'Step Up', aliases: ['עלייה על מדרגה'], category: 'legs', description: 'הפקת כוח על רגל אחת עם התקדמות פשוטה.', surfBenefit: 'כוח חד־צדדי לקימה ולשינויי כיוון', equipment: ['קופסה', 'דאמבלים'], metric: 'reps', sets: 3, reps: 8, weight: 12 }),
  exercise({ name: 'Box Jump', category: 'power', description: 'כוח מתפרץ ונחיתה יציבה.', surfBenefit: 'קימה מהירה ושליטה בנחיתה', equipment: ['קופסה'], metric: 'quality', sets: 4, reps: 4, weight: 0, gif: 'iPm26QU.gif' }),
  exercise({ name: 'Surf Pop-up', aliases: ['תרגול קימה לגלשן'], category: 'power', description: 'מעבר מהיר משכיבה לעמידת גלישה.', surfBenefit: 'תרגול ישיר של הקימה', equipment: ['מזרן'], metric: 'quality', sets: 4, reps: 5, weight: 0 }),
  exercise({ name: 'זריקת כדור כוח בסיבוב', aliases: ['Medicine Ball Rotational Throw'], category: 'power', description: 'כוח סיבובי מהיר מהקרקע דרך הגו.', surfBenefit: 'הפקת כוח בפניות', equipment: ['כדור כוח', 'קיר'], metric: 'quality', sets: 3, reps: 5, weight: 4 }),
  exercise({ name: 'דדליפט רומני', aliases: ['Romanian Deadlift', 'RDL'], category: 'hinge', description: 'שרשרת אחורית והמסטרינג בשליטה.', surfBenefit: 'יציבות ירך ועמידה נמוכה', equipment: ['מוט'], metric: 'reps', sets: 3, reps: 8, weight: 50, gif: 'wQ2c4XD.gif' }),
  exercise({ name: 'דדליפט', aliases: ['Deadlift'], category: 'hinge', description: 'כוח כללי לירך, גב וליבה.', surfBenefit: 'בסיס כוח כללי', equipment: ['מוט'], metric: 'reps', sets: 3, reps: 6, weight: 70, gif: 'ila4NZS.gif' }),
  exercise({ name: 'Single Leg RDL', aliases: ['דדליפט רומני על רגל אחת'], category: 'hinge', description: 'שרשרת אחורית ויציבות על רגל אחת.', surfBenefit: 'שליטה בקרסול ובאגן', equipment: ['דאמבל'], metric: 'reps', sets: 3, reps: 8, weight: 20, gif: 'gKozT8X.gif' }),
  exercise({ name: 'Hip Thrust', aliases: ['Glute Bridge', 'הרמת אגן'], category: 'hinge', description: 'פשיטת ירך עם עומס נמוך יחסית על הגב.', surfBenefit: 'כוח ישבן לקימה ולעמידה', equipment: ['ספסל', 'מוט'], metric: 'reps', sets: 3, reps: 10, weight: 40 }),
  exercise({ name: 'Kettlebell Swing', aliases: ['הנפת קטלבל'], category: 'power', description: 'כוח ירך מחזורי וסבולת כוח.', surfBenefit: 'כוח מתפרץ חוזר', equipment: ['קטלבל'], metric: 'quality', sets: 4, reps: 10, weight: 16 }),
  exercise({ name: 'פולי עליון', aliases: ['Lat Pulldown'], category: 'pull', description: 'משיכה אנכית לגב הרחב.', surfBenefit: 'תמיכה בכוח חתירה', equipment: ['כבל'], metric: 'reps', sets: 3, reps: 10, weight: 40, gif: 'rkg41Fb.gif' }),
  exercise({ name: 'Straight-arm Pulldown', aliases: ['משיכת ידיים ישרות'], category: 'pull', description: 'פשיטת כתף בשליטה עם דגש על הרחב גבי.', surfBenefit: 'סבולת לתנועת החתירה', equipment: ['כבל', 'גומייה'], metric: 'reps', sets: 3, reps: 12, weight: 15 }),
  exercise({ name: 'מתח', aliases: ['Pull-up'], category: 'pull', description: 'כוח משיכה יחסי.', surfBenefit: 'כוח גב וזרועות לחתירה', equipment: ['מתח'], metric: 'reps', sets: 3, reps: 5, weight: 0, gif: 'lBDjFxJ.gif' }),
  exercise({ name: 'חתירה הפוכה', aliases: ['Inverted Row'], category: 'pull', description: 'משיכה אופקית עם גוף יציב.', surfBenefit: 'שכמות וליבה תחת עומס', equipment: ['מוט'], metric: 'reps', sets: 3, reps: 10, weight: 0, gif: '4OaumBr.gif' }),
  exercise({ name: 'חתירה במכונה', aliases: ['Machine Row'], category: 'pull', description: 'נפח משיכה נשלט לגב העליון.', surfBenefit: 'סבולת שכמות וגב', equipment: ['מכונה'], metric: 'reps', sets: 3, reps: 10, weight: 45, gif: '7I6LNUG.gif' }),
  exercise({ name: 'חתירה נתמכת חזה', aliases: ['Chest-supported Row'], category: 'pull', description: 'חתירה ללא עייפות נוספת לגב התחתון.', surfBenefit: 'נפח משיכה כשעייפים מגלישה', equipment: ['ספסל', 'דאמבלים'], metric: 'reps', sets: 3, reps: 10, weight: 16 }),
  exercise({ name: 'לחיצת חזה במוט', aliases: ['Bench Press'], category: 'push', description: 'כוח דחיפה לחזה וליד האחורית.', surfBenefit: 'כוח דחיפה בקימה', equipment: ['מוט', 'ספסל'], metric: 'reps', sets: 3, reps: 8, weight: 50, gif: 'EIeI8Vf.gif' }),
  exercise({ name: 'לחיצת חזה בדאמבלים', aliases: ['Dumbbell Bench Press'], category: 'push', description: 'לחיצה עם עבודה עצמאית לכל צד.', surfBenefit: 'איזון כתפיים וכוח דחיפה', equipment: ['דאמבלים', 'ספסל'], metric: 'reps', sets: 3, reps: 10, weight: 18 }),
  exercise({ name: 'שכיבות סמיכה', aliases: ['Push-up'], category: 'push', description: 'דחיפה עם ליבה ושכמות פעילות.', surfBenefit: 'קימה חזקה ויציבה', equipment: ['משקל גוף'], metric: 'reps', sets: 3, reps: 12, weight: 0, gif: 'I4hDWkc.gif' }),
  exercise({ name: 'לחיצת כתפיים', aliases: ['Overhead Press'], category: 'push', description: 'דחיפה מעל הראש ויציבות ליבה.', surfBenefit: 'חוסן כתפיים', equipment: ['מוט', 'דאמבלים'], metric: 'reps', sets: 3, reps: 8, weight: 30, gif: 'znQUdHY.gif' }),
  exercise({ name: 'Landmine Press בחצי כריעה', aliases: ['Half-kneeling Landmine Press'], category: 'push', description: 'לחיצה אלכסונית ידידותית לכתף עם שליטת גו.', surfBenefit: 'חיבור כתף־ליבה', equipment: ['לנדמיין'], metric: 'reps', sets: 3, reps: 10, weight: 15 }),
  exercise({ name: 'Face Pull', aliases: ['משיכת פנים בכבל'], category: 'shoulders', description: 'שכמות, כתף אחורית וסיבוב חיצוני.', surfBenefit: 'איזון עומס החתירה', equipment: ['כבל', 'חבל'], metric: 'reps', sets: 3, reps: 12, weight: 12 }),
  exercise({ name: 'סיבוב חיצוני לכתף', aliases: ['Band External Rotation'], category: 'shoulders', description: 'חיזוק מסובבי הכתף בעומס קל.', surfBenefit: 'סבולת כתף לחתירה', equipment: ['גומייה', 'כבל'], metric: 'reps', sets: 3, reps: 15, weight: 5 }),
  exercise({ name: 'Serratus Wall Slide', aliases: ['החלקת קיר לסראטוס'], category: 'shoulders', description: 'שליטת שכמה וסיבוב כלפי מעלה.', surfBenefit: 'מכניקת כתף יעילה', equipment: ['קיר'], metric: 'reps', sets: 2, reps: 10, weight: 0 }),
  exercise({ name: 'Scapular Push-up', aliases: ['שכיבות סמיכה לשכמות'], category: 'shoulders', description: 'פרוטרקציה נשלטת וחיזוק סראטוס.', surfBenefit: 'יציבות שכמות בחתירה ובקימה', equipment: ['משקל גוף'], metric: 'reps', sets: 2, reps: 12, weight: 0 }),
  exercise({ name: 'הרחקות כתפיים', aliases: ['Lateral Raise'], category: 'shoulders', description: 'חיזוק כתף צידית בשליטה.', surfBenefit: 'חוסן כתף כללי', equipment: ['דאמבלים'], metric: 'reps', sets: 3, reps: 12, weight: 7, gif: 'DsgkuIt.gif' }),
  exercise({ name: 'כפיפות מרפקים', aliases: ['Biceps Curl'], category: 'shoulders', description: 'חיזוק זרוע קדמית כתוספת למשיכות.', surfBenefit: 'תמיכה במשיכות', equipment: ['דאמבלים'], metric: 'reps', sets: 2, reps: 12, weight: 8, gif: 'NbVPDMW.gif' }),
  exercise({ name: 'Pallof Press', aliases: ['פאלוף פרס'], category: 'core', description: 'לחיצה אנטי־רוטציונית.', surfBenefit: 'שמירת אגן וכתפיים מול סיבוב', equipment: ['כבל', 'גומייה'], metric: 'reps', sets: 3, reps: 10, weight: 12, gif: '9pa4H5m.gif' }),
  exercise({ name: 'Pallof Hold', aliases: ['Pallof Isometric', 'החזקת פאלוף'], category: 'core', description: 'החזקה איזומטרית נגד סיבוב.', surfBenefit: 'יציבות ממושכת בעמידה', equipment: ['כבל', 'גומייה'], metric: 'seconds', sets: 3, reps: 25, weight: 10 }),
  exercise({ name: 'Dead Bug', aliases: ['דד באג'], category: 'core', description: 'שליטת גו ואגן ללא עומס עמוד שדרה גבוה.', surfBenefit: 'חיבור גפיים לליבה', equipment: ['מזרן'], metric: 'reps', sets: 3, reps: 8, weight: 0 }),
  exercise({ name: 'Side Plank', aliases: ['פלאנק צד'], category: 'core', description: 'סבולת שרשרת צידית.', surfBenefit: 'יציבות בעמידה ובפניות', equipment: ['מזרן'], metric: 'seconds', sets: 3, reps: 30, weight: 0 }),
  exercise({ name: 'Copenhagen Plank', aliases: ['קופנהגן פלאנק'], category: 'core', description: 'אדקטורים וליבה צידית; מתחילים בגרסה קצרה.', surfBenefit: 'שליטה ברגליים וברוחב העמידה', equipment: ['ספסל'], metric: 'seconds', sets: 3, reps: 20, weight: 0 }),
  exercise({ name: 'Suitcase Carry', aliases: ['הליכת מזוודה'], category: 'carry', description: 'נשיאה חד־צדדית נגד כפיפה צידית.', surfBenefit: 'ליבה ואחיזה תחת עומס אסימטרי', equipment: ['דאמבל', 'קטלבל'], metric: 'distance', sets: 3, reps: 30, weight: 20 }),
  exercise({ name: 'Farmer Carry', aliases: ['הליכת חקלאי'], category: 'carry', description: 'אחיזה, יציבות גו וכושר עבודה.', surfBenefit: 'חוסן כללי ואחיזה', equipment: ['דאמבלים', 'קטלבלים'], metric: 'distance', sets: 3, reps: 40, weight: 24 }),
  exercise({ name: '90/90 Hip Rotation', aliases: ['90/90 hip rotation', 'סיבוב ירך 90/90'], category: 'mobility', description: 'סיבוב פנימי וחיצוני פעיל של הירך.', surfBenefit: 'טווח ירך לעמידה נמוכה ולפניות', equipment: ['מזרן'], metric: 'mobility', sets: 2, reps: 8, weight: 0 }),
  exercise({ name: 'Open-book Rotation', aliases: ['פתיחת ספר לחזה'], category: 'mobility', description: 'סיבוב בית חזה בשכיבה צדית.', surfBenefit: 'רוטציה ללא פיצוי מהגב התחתון', equipment: ['מזרן'], metric: 'mobility', sets: 2, reps: 8, weight: 0 }),
  exercise({ name: 'Ankle Dorsiflexion', aliases: ['מוביליות קרסול בחצי כריעה'], category: 'mobility', description: 'שיפור כפיפה קדמית של הקרסול.', surfBenefit: 'עמידה נמוכה ושינוי כיוון', equipment: ['קיר'], metric: 'mobility', sets: 2, reps: 10, weight: 0 }),
  exercise({ name: 'Couch Stretch', aliases: ['מתיחת מכופפי ירך'], category: 'mobility', description: 'מתיחת מכופפי ירך וקדמת ירך.', surfBenefit: 'נוחות בעמידה וקימה', equipment: ['קיר', 'ספסל'], metric: 'seconds', sets: 2, reps: 45, weight: 0 }),
  exercise({ name: 'Adductor Rock-back', aliases: ['נדנוד אדקטורים'], category: 'mobility', description: 'מוביליות מקרבים בשליטה.', surfBenefit: 'רוחב עמידה ותנועה באגן', equipment: ['מזרן'], metric: 'mobility', sets: 2, reps: 10, weight: 0 }),
];

export function mergeExerciseBank(saved: BankExercise[] | null | undefined) {
  const byName = new Map(baseExerciseBank.map((item) => [item.name.toLocaleLowerCase(), item]));
  for (const item of saved || []) byName.set(item.name.toLocaleLowerCase(), item);
  return [...byName.values()];
}

export function exerciseExists(bank: BankExercise[], name: string) {
  const target = name.trim().toLocaleLowerCase();
  return bank.some((item) => item.name.toLocaleLowerCase() === target || item.aliases.some((alias) => alias.toLocaleLowerCase() === target));
}
