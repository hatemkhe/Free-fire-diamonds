import { QuizQuestion, WouldYouRatherQuestion } from './types';

/**
 * Calculations for secret diminishing returns point logic.
 * - From 0 to 900 points: Full points added (100% value)
 * - From 900 to 950 points: 10% of game value
 * - From 950 to 990 points: 1% of game value
 * - From 990 to 999 points: 0.01 points per action, or 50% chance of fake server error.
 */
export function addPointsWithDiminishingReturns(currentPoints: number, reward: number): {
  added: number;
  newPoints: number;
  error?: string;
} {
  if (currentPoints >= 990) {
    // 40% chance of fake connection error to create frustration/suspense
    if (Math.random() < 0.4) {
      return {
        added: 0,
        newPoints: currentPoints,
        error: "حدث خطأ في الاتصال بالسيرفر المركزي لـ Free Fire (Error Code: 502 Bad Gateway). لم نتمكن من مزامنة النقاط، يرجى المحاولة مرة أخرى."
      };
    }
    const added = 0.01;
    const newPoints = Math.min(999.99, Number((currentPoints + added).toFixed(2)));
    return { added, newPoints };
  }

  let remainingReward = reward;
  let tempPoints = currentPoints;
  let totalAdded = 0;

  while (remainingReward > 0) {
    const chunk = Math.min(1, remainingReward);
    remainingReward -= chunk;

    let multiplier = 1.0;
    if (tempPoints >= 990) {
      multiplier = 0.01;
    } else if (tempPoints >= 950) {
      multiplier = 0.01; // 1% points
    } else if (tempPoints >= 900) {
      multiplier = 0.1;  // 10% points
    }

    const addedChunk = chunk * multiplier;
    tempPoints += addedChunk;
    totalAdded += addedChunk;
  }

  const newPoints = Number(tempPoints.toFixed(2));
  const added = Number(totalAdded.toFixed(2));

  return { added, newPoints };
}

// 10 Quiz Questions (Gaming & Trivia)
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "ما هو اسم الخريطة الأساسية والأكثر شهرة في لعبة فري فاير (Free Fire)؟",
    options: ["برمودا (Bermuda)", "كالاهاري (Kalahari)", "بوجاتوري (Purgatory)"],
    correctIndex: 0,
    pointsReward: 50
  },
  {
    id: 2,
    question: "أي من هذه الشخصيات في فري فاير تمتلك مهارة 'Drop the Beat' لزيادة السرعة واستعادة الصحة؟",
    options: ["كرونو (Chrono)", "الوك (Alok)", "كابتن بويا (K)"],
    correctIndex: 1,
    pointsReward: 50
  },
  {
    id: 3,
    question: "ما هو السلاح الذي يُعتبر أقوى قناصة في ألعاب الباتل رويال ويلقب بـ 'ملك القنص'؟",
    options: ["M4A1", "AWM", "Kar98k"],
    correctIndex: 1,
    pointsReward: 60
  },
  {
    id: 4,
    question: "ما هو المصطلح الشهير الذي يطلق على إقصاء الفريق الخصم بالكامل في الألعاب الجماعية؟",
    options: ["Ace / Squad Wipe", "Clutch", "Booyah!"],
    correctIndex: 0,
    pointsReward: 40
  },
  {
    id: 5,
    question: "في أي عام تم إطلاق لعبة فري فاير رسمياً بواسطة شركة Garena؟",
    options: ["2016", "2017", "2019"],
    correctIndex: 1,
    pointsReward: 70
  },
  {
    id: 6,
    question: "ما هو الاسم الحقيقي للشركة المطورة والناشرة للعبة فري فاير؟",
    options: ["Tencent", "Garena", "Epic Games"],
    correctIndex: 1,
    pointsReward: 45
  },
  {
    id: 7,
    question: "ما اسم الشخصية التي تمثل لاعب كرة القدم الشهير كريستيانو رونالدو في فري فاير؟",
    options: ["الوك (Alok)", "كرونو (Chrono)", "مكسيم (Maxim)"],
    correctIndex: 1,
    pointsReward: 55
  },
  {
    id: 8,
    question: "أي من الدروع التالية يوفر أعلى نسبة حماية ممكنة في معارك فري فاير؟",
    options: ["درع مستوى 3", "درع مستوى 4", "الدرع الذهبي المعزز"],
    correctIndex: 2,
    pointsReward: 80
  },
  {
    id: 9,
    question: "ما هو اسم الحيوان الأليف (Pet) الأكثر شعبية في فري فاير الذي يساعد على زيادة مسافة رمي القنابل؟",
    options: ["بيستون (Beaston)", "فالكو (Falco)", "السيد واغور (Mr. Waggor)"],
    correctIndex: 0,
    pointsReward: 50
  },
  {
    id: 10,
    question: "ماذا تعني كلمة 'Booyah' التي تظهر عند الفوز بالمرتبة الأولى في فري فاير؟",
    options: ["انتصار ساحق وفرحة الفوز", "الخسارة بشرف", "بداية معركة جديدة"],
    correctIndex: 0,
    pointsReward: 90
  }
];

// 10 Would You Rather Questions (Gaming Themed)
export const WOULD_YOU_RATHER_QUESTIONS: WouldYouRatherQuestion[] = [
  {
    id: 1,
    optionA: "الحصول على 10,000 جوهرة فري فاير فوراً ولكن اللعب بمفردك دائماً",
    optionB: "اللعب مع أصدقائك دائماً ولكن باستخدام سكنات وأسلحة افتراضية مجانية",
    votesA: 64,
    votesB: 36
  },
  {
    id: 2,
    optionA: "أن تمتلك مهارة إيمبوت (Aimbot) خارقة لا يمكن كشفها أبداً",
    optionB: "أن تمتلك جميع السكنات والملابس النادرة والقديمة (الهيب هوب وغيره) مجاناً",
    votesA: 42,
    votesB: 58
  },
  {
    id: 3,
    optionA: "اللعب بمعدل إطارات 240Hz ثابت على هاتف صغير الحجم",
    optionB: "اللعب بمعدل إطارات 60Hz على شاشة عرض عملاقة بدقة 4K",
    votesA: 71,
    votesB: 29
  },
  {
    id: 4,
    optionA: "تكون محترفاً مشهوراً عالمياً (بروفيسور/يوتيوبر) ولديك ملايين المتابعين",
    optionB: "تكون لاعباً عادياً جداً ولكن تربح 5000$ شهرياً من المسابقات السرية للعبة",
    votesA: 33,
    votesB: 67
  },
  {
    id: 5,
    optionA: "اللعب دائماً بسلاح AWM (قناص) بدون منظار (Scope)",
    optionB: "اللعب دائماً بسلاح مسدس فقط ولكن بضرر مضاعف 10 مرات",
    votesA: 49,
    votesB: 51
  },
  {
    id: 6,
    optionA: "حذف خريطة برمودا نهائياً واستبدالها بخريطة ثلجية جديدة كلياً",
    optionB: "الإبقاء على برمودا كما هي مع إلغاء كافة سكنات الأسلحة المطورة",
    votesA: 82,
    votesB: 18
  },
  {
    id: 7,
    optionA: "أن تلعب لعبة واحدة فقط طوال حياتك (فري فاير) وتكون بطل العالم فيها",
    optionB: "أن تلعب جميع الألعاب الموجودة في العالم بمستوى متوسط دون احتراف أي منها",
    votesA: 55,
    votesB: 45
  },
  {
    id: 8,
    optionA: "الفوز بالـ Booyah دائماً ولكن بصفر كيلات (Kill)",
    optionB: "إحراز 25 كيل (Kill) في الجيم ولكن الخسارة في المركز الثاني دائماً",
    votesA: 28,
    votesB: 72
  },
  {
    id: 9,
    optionA: "شحن رقصات وسكنات نادرة تظهر للاعبين الآخرين ولا تظهر لك",
    optionB: "شحن أسلحة مطورة بخصائص خارقة تظهر لك فقط ولا يراها بقية اللاعبين",
    votesA: 15,
    votesB: 85
  },
  {
    id: 10,
    optionA: "مواجهة أقوى سكواد محترف في اللعبة وهزيمتهم بصعوبة بالغة",
    optionB: "مواجهة 50 لاعب بوت (Bot) وتصفيتهم جميعاً بضربة واحدة وسهلة",
    votesA: 68,
    votesB: 32
  }
];
