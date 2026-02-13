import { Difficulty } from './schemas/game-level.schema';
import { GameType } from './schemas/game-score.schema';

// ==========================================
// WORD CONNECT LEVELS (dictionary-driven)
// ==========================================
const normalizeWord = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z]/g, '');

const hasUniqueLetters = (word: string): boolean => {
  const chars = word.split('');
  return new Set(chars).size === chars.length;
};

const canBuildFromLetters = (word: string, letters: string[]): boolean => {
  const pool = new Map<string, number>();
  for (const char of letters) {
    pool.set(char, (pool.get(char) || 0) + 1);
  }

  for (const char of word) {
    const remaining = pool.get(char) || 0;
    if (remaining <= 0) return false;
    pool.set(char, remaining - 1);
  }

  return true;
};

const difficultyFromLevelShape = (letterCount: number, wordCount: number): Difficulty => {
  if (letterCount <= 4) {
    return wordCount >= 7 ? Difficulty.MEDIUM : Difficulty.EASY;
  }
  if (letterCount === 5) {
    return wordCount >= 10 ? Difficulty.HARD : Difficulty.MEDIUM;
  }
  if (letterCount === 6) {
    return wordCount >= 12 ? Difficulty.EXPERT : Difficulty.HARD;
  }
  return Difficulty.EXPERT;
};

const minWordsByLetterCount: Record<number, number> = {
  4: 4,
  5: 6,
  6: 8,
  7: 10,
  8: 11,
};

const capWordsByLetterCount: Record<number, number> = {
  4: 9,
  5: 12,
  6: 15,
  7: 18,
  8: 20,
};

const WORD_CONNECT_SHORT_DICTIONARY = `
AN AS AT AM AX BE BY DO GO HE IF IN IS IT ME MY NO OF ON OR OX TO UP US WE
ACE ACT ADD ADO ADS AGE AGO AID AIL AIM AIR ALE ALL ANT ANY ARC ARE ARM ART ASH ASK ATE
AWE AWL BAD BAG BAN BAR BAT BAY BED BEE BEN BET BID BIG BIN BIT BOB BOG BOY BRA BUG BUN
BUS BUT BUY CAB CAD CAN CAP CAR CAT COW COP COD COG COT CUB CUP CUT DAY DEN DEW DID DIE DIG
DIN DIP DOE DOG DOT DRY DUB DUE DUO EAR EAT EEL EGG EGO ELF ELM END ERA EVE EYE FAN FAR FAT
FED FEE FEW FIG FIN FIR FIT FIX FLY FOE FOG FOR FOX FUN FUR GAP GAS GEM GET GIG GIN GOD GUM
GUN GUY HAD HAS HAT HAY HEM HEN HER HID HIM HIP HIT HOG HOP HOT HOW HUG HUT ICE INK ION ITS
JAM JAR JAW JET JIG JOB JOG JOY KEY KID KIN KIT LAB LAD LAG LAP LAW LAY LEG LET LID LIE LIP
LIT LOG LOT LOW MAD MAN MAP MAT MAY MEN MET MID MIL MIX MOB MOP MUD MUG NAP NET NEW NOD NOR
NOT NOW NUN NUT OAR ODD ORE OUR OUT OVA OWE OWN PAD PAL PAN PAR PAT PAW PAY PEA PEG PEN PET
PIE PIG PIN PIT POD POP POT PRO PUB PUN PUP PUT RAG RAM RAN RAP RAT RAW RAY RED RIB RID RIG
RIM RIP ROB ROD ROE ROT ROW RUB RUG RUN RYE SAD SAG SAT SAW SAY SEA SEE SET SEW SHE SHY SIN
SIP SIT SIX SKI SKY SOB SON SOW SPA SUB SUE SUM SUN TAB TAG TAN TAP TAR TAX TEA TEN TIE TIN
TIP TOE TOM TON TOP TOW TOY TRY TUB TUG TWO USE VAN VAT VET VOW WAR WAS WAX WAY WEB WED WET
WHO WHY WIG WIN WIT WOE WOK WON WOW YAK YAM YAP YAW YEN YES YET YOU ZAP ZEN ZIP ZOO
ABLE ACID ACNE AGED ALSO AMEN ANEW APEX ARCH AREA ARTS ATOM AUNT AWAY AXIS BABY BACK BAKE
BALL BAND BANK BARE BARK BASE BATH BEAD BEAK BEAM BEAN BEAR BEAT BELL BELT BEND BENT BEST
BETA BIND BIRD BITE BLADE BLOW BLUE BOAT BODY BOLD BONE BOOK BOOM BOOT BORE BORN BOSS BOTH
BOWL BULB BURN BURY BUSH BUSY CAFE CAKE CALM CAME CAMP CARD CARE CASE CASH CAST CAVE CELL
CHAT CHEF CHIP CITY CLAY CLUB COAL COAT CODE COIN COLD COME COOK COOL COPE CORE COST CREW
CROP CURE CURL CURB DARE DARK DATA DATE DAWN DEAL DEAR DEBT DEEP DESK DIAL DICE DIET DIME
DINE DIRT DISH DIVE DOCK DOME DONE DOOR DOSE DOWN DRAG DRAW DROP DRUM DUAL DUST DUTY EACH
EARN EASE EAST EDGE EDIT EVEN EVER EXIT FACE FACT FADE FAIL FAIR FALL FAME FARM FAST FATE
FEAR FEAT FEED FEEL FILE FILM FIND FIRE FIRM FISH FIZZ FLAG FLAT FLEA FLEW FLOW FOOD FOOT
FORM FORT FUEL FULL FUND GAIN GAME GATE GEAR GIFT GIRL GIVE GLAD GLASS GLOW GOAL GOLD GOLF
GOOD GRAIN GRIP GROW HAIR HALF HALL HAND HANG HARD HARM HATE HAVE HEAD HEAL HEAR HEAT HELP
HIDE HILL HINT HIRE HOLD HOLE HOLY HOME HOPE HORN HOST HOUR HUGE HUNT HURT IDEA IDLE INTO
IRON ITEM JAIL JOIN JOKE JOLT JUMP JURY JUST KEEP KENT KICK KIND KING KITE KNEE KNIT KNOW
LACE LACK LAKE LAND LANE LAST LATE LEAD LEAF LEAN LEAP LEFT LENS LESS LICK LIFE LIFT LIKE
LINE LINK LIST LIVE LOAD LOAN LOCK LONG LOOK LORD LOSE LOSS LOUD LOVE LUCK LUNG MADE MAIL
MAIN MAKE MANY MARK MATE MATH MEAL MEAN MEET MELT MENU MESS MILD MIND MINE MISS MODE MOON
MORE MOST MOVE MUCH MUST NAME NAVY NEAR NEAT NEED NEST NICE NICK NODE NOSE NOTE OATH ONCE
ONLY OPEN ORAL OVER PACK PAGE PAIN PAIR PALE PARK PART PASS PAST PATH PEAK PEAR PEEL PEER
PICK PILE PINE PINK PIPE PLAN PLAY PLOT PLUS POEM POLE POOL POOR PORT POST PREP PURE PUSH
RACE RACK RAGE RAIL RAIN RANK RATE READ REAL REAP REAR RENT REST RICE RICH RIDE RING RISE
RISK ROAD ROCK ROLE ROOF ROOM ROOT ROPE ROSE RULE RUSH SAFE SAIL SALT SAME SAND SAVE SCAN
SEAL SEAT SEED SEEK SEEN SELF SELL SEND SHIP SHOP SHOT SHOW SIDE SIGN SILK SING SITE SIZE
SKIN SLIP SLOW SNOW SOFT SOIL SOLD SOLE SONG SOON SORT SOUL SPIN STAR STAY STEM STEP STIR
STOP STORM STOW SUCH SUIT SURE SWIM TAKE TALE TALK TALL TANK TASK TEAM TELL TEND TERM TEST
THAN THAT THEM THEN TIDE TIES TIME TINY TONE TONG TOOL TOUR TOWN TRAP TREE TRIP TRUE TUNE
TURN TYPE UNIT UPON URGE USER USED VARY VAST VERY VIEW VINE VOID VOTE WAKE WALK WALL WARM
WASH WAVE WEAK WEAR WEEP WELL WENT WEST WHAT WHEN WHIP WIDE WIFE WILD WILL WIND WINE WING
WIRE WISH WOOD WOOL WORD WORK YARD YEAR YELL YOGA YOUNG YOUR ZONE
`.trim().split(/\s+/);

// ==========================================
// DAILY MYSTERY WORDS (200+ words)
// ==========================================
const dailyWordsRaw = [
  'BRAIN', 'LOGIC', 'SMART', 'THINK', 'LEARN', 'FOCUS', 'SOLVE', 'QUEST',
  'PUZZLE', 'MINDS', 'POWER', 'SHARP', 'QUICK', 'SKILL', 'GAMES', 'PLAYS',
  'WORDS', 'START', 'FOUND', 'GREAT', 'POINT', 'SCORE', 'LEVEL', 'BONUS',
  'TRAIN', 'BRAIN', 'MATCH', 'SPEED', 'CHAIN', 'BLAST', 'WORLD', 'SPACE',
  'STARS', 'EARTH', 'WATER', 'FIRE', 'WIND', 'STORM', 'CLOUD', 'LIGHT',
  'NIGHT', 'DREAM', 'SLEEP', 'AWAKE', 'FRESH', 'CLEAN', 'CLEAR', 'SHINE',
  'GLOW', 'SPARK', 'FLAME', 'BLAZE', 'BURNS', 'HEATS', 'COOLS', 'FROST',
  'SNOW', 'RAIN', 'DROPS', 'FLOOD', 'WAVES', 'OCEAN', 'BEACH', 'SANDY',
  'SHELL', 'CORAL', 'REEFS', 'FISHES', 'WHALE', 'SHARK', 'DOLPHIN', 'SEALS',
  'BIRDS', 'EAGLE', 'HAWKS', 'OWLS', 'DOVES', 'SWANS', 'DUCKS', 'GEESE',
  'LIONS', 'TIGER', 'BEARS', 'WOLF', 'FOXES', 'DEER', 'MOOSE', 'HORSE',
  'ZEBRA', 'GIRAFFE', 'ELEPHANT', 'RHINO', 'HIPPO', 'CROCS', 'SNAKE', 'LIZARD',
  'FROG', 'TOAD', 'NEWTS', 'GECKO', 'IGUANA', 'TURTLE', 'CRAB', 'LOBSTER',
  'HAPPY', 'MERRY', 'JOLLY', 'CHEER', 'SMILE', 'LAUGH', 'GRINS', 'BEAMS',
  'PEACE', 'CALM', 'QUIET', 'STILL', 'RELAX', 'CHILL', 'COZY', 'WARM',
  'BRAVE', 'BOLD', 'DARING', 'HERO', 'SUPER', 'POWER', 'MIGHT', 'FORCE',
  'HONOR', 'GLORY', 'FAME', 'PRIDE', 'GRACE', 'CHARM', 'STYLE', 'CLASS',
  'TREND', 'VOGUE', 'CHIC', 'SLEEK', 'SMART', 'SHARP', 'CRISP', 'FRESH',
  'DANCE', 'MUSIC', 'SONGS', 'BEATS', 'RHYTHM', 'TEMPO', 'TUNES', 'NOTES',
  'PIANO', 'GUITAR', 'DRUMS', 'FLUTE', 'VIOLIN', 'CELLO', 'HARP', 'BRASS',
  'VOICE', 'CHOIR', 'BAND', 'ORCHESTRA', 'JAZZ', 'BLUES', 'ROCK', 'FOLK',
  'PAINT', 'DRAW', 'SKETCH', 'COLOR', 'BRUSH', 'CANVAS', 'FRAME', 'GALLERY',
  'PHOTO', 'FILM', 'MOVIE', 'SCENE', 'ACTOR', 'DRAMA', 'COMEDY', 'HORROR',
  'STORY', 'NOVEL', 'BOOKS', 'READS', 'PAGES', 'WORDS', 'LINES', 'VERSE',
  'POEM', 'RHYME', 'PROSE', 'ESSAY', 'LETTER', 'WRITE', 'PRINT', 'PUBLISH',
  'COOK', 'BAKE', 'ROAST', 'GRILL', 'STEAM', 'BOIL', 'SLICE', 'CHOP',
  'BLEND', 'MIX', 'STIR', 'WHISK', 'POUR', 'SERVE', 'TASTE', 'SAVOR',
  'SWEET', 'SALTY', 'SOUR', 'SPICY', 'BITTER', 'RICH', 'MILD', 'TANGY',
  'BREAD', 'TOAST', 'PASTA', 'RICE', 'BEANS', 'SALAD', 'SOUP', 'STEW',
  'PIZZA', 'BURGER', 'TACOS', 'SUSHI', 'CURRY', 'FRIES', 'CHIPS', 'CANDY',
  'FRUIT', 'APPLE', 'GRAPE', 'MELON', 'BERRY', 'PEACH', 'PLUM', 'MANGO',
  'CITRUS', 'LEMON', 'LIME', 'ORANGE', 'BANANA', 'KIWI', 'PEAR', 'CHERRY',
  'COFFEE', 'TEA', 'JUICE', 'WATER', 'MILK', 'SODA', 'DRINK', 'BEVERAGE',
  'HOUSE', 'HOME', 'BUILD', 'ROOMS', 'WALLS', 'DOORS', 'FLOOR', 'ROOF',
  'WINDOW', 'GLASS', 'BRICK', 'STONE', 'WOOD', 'STEEL', 'METAL', 'TILE',
  'CHAIR', 'TABLE', 'DESK', 'COUCH', 'BED', 'SHELF', 'LAMP', 'RUG',
  'GARDEN', 'LAWN', 'TREES', 'PLANTS', 'FLOWER', 'GRASS', 'HEDGE', 'FENCE',
  'STREET', 'ROAD', 'PATH', 'LANE', 'BRIDGE', 'TUNNEL', 'CROSS', 'TURN',
  'DRIVE', 'RIDE', 'WALK', 'RUN', 'SPRINT', 'JOG', 'HIKE', 'CLIMB',
  'TRAVEL', 'JOURNEY', 'TRIP', 'VOYAGE', 'CRUISE', 'FLIGHT', 'TRAIN', 'METRO',
  'WORK', 'OFFICE', 'JOB', 'CAREER', 'BUSINESS', 'COMPANY', 'TEAM', 'GROUP',
  'MEETING', 'CALL', 'EMAIL', 'MESSAGE', 'REPLY', 'SEND', 'POST', 'SHARE',
  'FRIEND', 'FAMILY', 'LOVE', 'CARE', 'TRUST', 'FAITH', 'HOPE', 'DREAM',
  'GOAL', 'PLAN', 'PATH', 'STEP', 'MOVE', 'GROW', 'REACH', 'ACHIEVE',
].filter(w => w.length === 5);

const WORD_CONNECT_EXTRA_CHALLENGE_WORDS = `
ABSENT ABSORB ACTIVE ADVICE AERIAL AFFIX AGILE ANCHOR ANNUAL APPEAL ARCANE
BADGER BALANCE BANNER BATTLE BEACON BEAUTY BEHAVE BELONG BETTER BINARY BLAZER
BORDER BRAINY BRANCH BRIGHT BROKER BUDGET BULLET BUTTER BUTTON CANDLE CANVAS
CAPTAIN CAREFUL CARRIER CARTON CAUTION CHAMBER CHARGER CHARTER CIRCLE CLIENT
CLIMBER CLOTHES COASTER COMBINE COMFORT COMPACT COMPASS CONCERT CONDUCT CONSENT
CONTACT CONVERT CORNER COTTON COUNTRY CRAFTED CREATOR CREDIT CRYSTAL CUSTOM
DAMAGE DANCER DEALER DEBATE DECODE DECORATE DEFEND DELIVER DEMAND DENTAL DEPART
DETAIL DEVOUR DIALOG DIRECT DOCTOR DOMAIN DRAGON DRAWER DRIVER DYNAMIC EASILY
EDITOR EFFECT EITHER EMPIRE ENABLE ENERGY ENGINE ENJOYER ENTIRE EQUATOR ESCAPE
ESTATE ETHICS EVOLVE EXAMPLE EXCITE EXCITED EXHIBIT EXPORT FABRIC FACTOR FAMOUS
FASHION FATHER FELLOW FIBER FINALIZE FINANCE FIXTURE FLIGHT FLOWER FOCUSED FOREST
FORMAL FORTUNE FORWARD FREEZER FRIENDLY FROZEN FUTURE GALAXY GARDEN GENERAL
GENIUS GLOBAL GOLDEN GRAVITY HARBOR HARMONY HEALTH HERALD HIDDEN HIGHWAY HUNTER
IGNORE IMPACT IMPORT IMPROVE INCOME INSIGHT INVEST ISLAND JACKET JUNGLE JUSTICE
KERNEL KEYBOARD KINDLE KITTEN LADDER LANDER LAUNCH LEADER LEGACY LETTER LIBERTY
LIMIT LIGHTER LINKED LIQUID LISTEN LITTLE LOGICAL LUXURY MAGNET MAKER MARKET
MASTER MEADOW MEMORY MENTOR MIDDLE MIRROR MOBILE MODERN MOMENT MONITOR MOTHER
MOTION MOUNTAIN MYSTIC NATION NATURE NEUTRAL NICKEL NORMAL NOTICE NOVELTY NUCLEAR
OBJECT OCEANIC OFFICE OPTICAL ORBIT ORCHARD OUTFIT OUTPUT OXFORD PACKET PAINTER
PANEL PARALLEL PARENT PARTNER PASSAGE PATTERN PEARL PENCIL PEOPLE PHOENIX PILOT
PLANET PLANNER PLAYER PLEASURE POCKET POETRY POLAR PORTAL POTENTIAL POWDER PRAYER
PREMIUM PRESENT PREVENT PRINTER PRIVACY PROBLEM PROCESS PRODUCT PROFILE PROJECT
PROMISE PROPER PROTECT PROTEIN PROTON PULSAR PURPLE QUALITY QUANTUM QUIETLY RANGER
RAPTURE READER REBOUND RECORD REFLECT REFORM REGION RELAXED RELIANCE REMOTE RENDER
REPAIR REPEAT REPORT RESCUE RESERVE RESULT RETAIN RETRO REWARD RHYTHM ROCKET ROUTER
SAFETY SALMON SAMPLE SATURN SCALAR SCHOLAR SCREEN SEARCH SEASON SENSOR SERVER SHADOW
SHARING SIGNAL SILENCE SILVER SIMPLE SINGLE SINGER SKETCH SOCKET SOLAR SOLUTION
SOURCE SPARKLE SPEAKER SPIRIT SPOKEN STABLE STATION STEEL STORY STRANGE STRATEGY
STREAM STRING STRONG STUDIO SUBMIT SUBTLE SUDDEN SUNSET SUPPLY SURFACE SYSTEM TABLET
TALENT TARGET TEMPLE TENDER THEORY THRIVE TICKET TIMBER TOPIC TOTAL TRACKER TRAVEL
TREASURE TRIGGER TUNNEL TURBINE UNION UNIVERSE UPDATE UPWARD USEFUL VACUUM VALID
VALLEY VENTURE VERSION VICTORY VILLAGE VINTAGE VIOLET VISION VISUAL VOYAGE WALLET
WEALTH WELCOME WINDOW WINTER WONDER WORKER WRITER YELLOW ZODIAC
`.trim().split(/\s+/);

const dailyMysteryPool = Array.from(
  new Set(
    [...dailyWordsRaw, ...WORD_CONNECT_SHORT_DICTIONARY, ...WORD_CONNECT_EXTRA_CHALLENGE_WORDS]
      .map(normalizeWord)
      .filter((word) => word.length === 5),
  ),
);

const buildWordConnectLevels = () => {
  const dictionary = Array.from(new Set(
    [...WORD_CONNECT_SHORT_DICTIONARY, ...WORD_CONNECT_EXTRA_CHALLENGE_WORDS, ...dailyMysteryPool]
      .map(normalizeWord)
      .filter((word) => word.length >= 2 && word.length <= 8)
  ));

  const levelBySignature = new Map<string, {
    letters: string[];
    words: string[];
    score: number;
    difficulty: Difficulty;
    hint: string;
  }>();

  const seedWords = dictionary.filter((word) => word.length >= 4 && word.length <= 8 && hasUniqueLetters(word));

  for (const seed of seedWords) {
    const letters = seed.split('');
    const letterCount = letters.length;
    const minWords = minWordsByLetterCount[letterCount] || 6;
    const maxWords = capWordsByLetterCount[letterCount] || 12;

    const buildableWords = dictionary
      .filter((word) => word.length >= 2 && word.length <= letterCount)
      .filter((word) => canBuildFromLetters(word, letters))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .slice(0, maxWords);

    if (buildableWords.length < minWords) continue;

    const difficulty = difficultyFromLevelShape(letterCount, buildableWords.length);
    const signature = letters.slice().sort().join('');
    const score = buildableWords.length * 10 + buildableWords.reduce((sum, word) => sum + word.length, 0);
    const hint =
      difficulty === Difficulty.EXPERT
        ? 'Expert letter web: find all hidden words.'
        : difficulty === Difficulty.HARD
          ? 'Complex mix: discover every valid word.'
          : difficulty === Difficulty.MEDIUM
            ? 'Build as many words as possible from these letters.'
            : 'Start with shorter words, then find the longest one.';

    const existing = levelBySignature.get(signature);
    if (!existing || score > existing.score) {
      levelBySignature.set(signature, {
        letters,
        words: buildableWords,
        score,
        difficulty,
        hint,
      });
    }
  }

  const byDifficulty = {
    [Difficulty.EASY]: [] as Array<{ letters: string[]; words: string[]; score: number; difficulty: Difficulty; hint: string }>,
    [Difficulty.MEDIUM]: [] as Array<{ letters: string[]; words: string[]; score: number; difficulty: Difficulty; hint: string }>,
    [Difficulty.HARD]: [] as Array<{ letters: string[]; words: string[]; score: number; difficulty: Difficulty; hint: string }>,
    [Difficulty.EXPERT]: [] as Array<{ letters: string[]; words: string[]; score: number; difficulty: Difficulty; hint: string }>,
  };

  for (const level of levelBySignature.values()) {
    byDifficulty[level.difficulty].push(level);
  }

  byDifficulty[Difficulty.EASY].sort((a, b) => a.score - b.score);
  byDifficulty[Difficulty.MEDIUM].sort((a, b) => a.score - b.score);
  byDifficulty[Difficulty.HARD].sort((a, b) => b.score - a.score);
  byDifficulty[Difficulty.EXPERT].sort((a, b) => b.score - a.score);

  const targets = {
    [Difficulty.EASY]: 120,
    [Difficulty.MEDIUM]: 160,
    [Difficulty.HARD]: 180,
    [Difficulty.EXPERT]: 160,
  };

  const selected = [
    ...byDifficulty[Difficulty.EASY].slice(0, targets[Difficulty.EASY]),
    ...byDifficulty[Difficulty.MEDIUM].slice(0, targets[Difficulty.MEDIUM]),
    ...byDifficulty[Difficulty.HARD].slice(0, targets[Difficulty.HARD]),
    ...byDifficulty[Difficulty.EXPERT].slice(0, targets[Difficulty.EXPERT]),
  ];

  return selected.map((level, index) => ({
    gameType: GameType.WORD_CONNECT,
    level: index + 1,
    difficulty: level.difficulty,
    letters: level.letters,
    words: level.words,
    hint: level.hint,
  }));
};

export const wordConnectLevels = buildWordConnectLevels();

export const dailyMysteryWords = dailyMysteryPool.map((word, index) => ({
  gameType: GameType.DAILY_MYSTERY_WORD,
  level: index + 1,
  word: word.toUpperCase(),
  difficulty: (() => {
    const ratio = (index + 1) / Math.max(1, dailyMysteryPool.length);
    if (ratio <= 0.35) return Difficulty.EASY;
    if (ratio <= 0.65) return Difficulty.MEDIUM;
    if (ratio <= 0.9) return Difficulty.HARD;
    return Difficulty.EXPERT;
  })(),
}));

// ==========================================
// PATTERN SPOTTER LEVELS (100+ patterns)
// ==========================================
function generatePatternLevels() {
  const levels: Array<{
    gameType: GameType;
    level: number;
    difficulty: Difficulty;
    sequence: number[];
    answer: number;
    options: number[];
    patternType: string;
  }> = [];
  let levelNum = 1;

  const buildOptions = (answer: number, spread: number, rotateBy: number): number[] => {
    const unique = Array.from(
      new Set([
        answer,
        answer + spread,
        answer - spread,
        answer + spread * 2,
      ]),
    );

    while (unique.length < 4) {
      unique.push(answer + unique.length + 2);
    }

    const shift = ((rotateBy % unique.length) + unique.length) % unique.length;
    return unique.slice(shift).concat(unique.slice(0, shift));
  };

  // Arithmetic progressions: 80 levels
  for (let i = 0; i < 80; i++) {
    const start = 6 + i;
    const diff = 2 + (i % 11);
    const sequence = Array.from({ length: 4 }, (_, j) => start + diff * j);
    const answer = start + diff * 4;
    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 30 ? Difficulty.EASY : i < 60 ? Difficulty.MEDIUM : Difficulty.HARD,
      sequence,
      answer,
      options: buildOptions(answer, Math.max(2, Math.floor(diff / 2) + 1), i),
      patternType: 'arithmetic',
    });
  }

  // Geometric progressions: 50 levels
  for (let i = 0; i < 50; i++) {
    const start = 2 + (i % 7);
    const ratio = 2 + (i % 3);
    const sequence = Array.from({ length: 4 }, (_, j) => start * Math.pow(ratio, j));
    const answer = start * Math.pow(ratio, 4);
    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 15 ? Difficulty.MEDIUM : i < 35 ? Difficulty.HARD : Difficulty.EXPERT,
      sequence,
      answer,
      options: buildOptions(answer, Math.max(2, ratio * (i % 4 + 1)), i + 1),
      patternType: 'geometric',
    });
  }

  // Squares and near-squares: 40 levels
  for (let i = 0; i < 40; i++) {
    const start = 3 + i;
    const sequence = Array.from({ length: 4 }, (_, j) => {
      const n = start + j;
      return n * n;
    });
    const next = start + 4;
    const answer = next * next;
    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 15 ? Difficulty.HARD : Difficulty.EXPERT,
      sequence,
      answer,
      options: buildOptions(answer, next + 3, i + 2),
      patternType: 'squares',
    });
  }

  // Fibonacci-like mixed starts: 30 levels
  for (let i = 0; i < 30; i++) {
    const a = 1 + (i % 8);
    const b = 2 + ((i * 2) % 9);
    const sequence = [a, b, a + b, a + 2 * b];
    const answer = 2 * a + 3 * b;
    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 10 ? Difficulty.HARD : Difficulty.EXPERT,
      sequence,
      answer,
      options: buildOptions(answer, Math.max(2, a + b), i + 3),
      patternType: 'fibonacci',
    });
  }

  return levels;
}

export const patternSpotterLevels = generatePatternLevels();

// ==========================================
// RIDDLE ARENA (50 riddles for multiplayer)
// ==========================================
export const riddleArenaLevels = [
  { question: "What has hands but can't clap?", options: ['Clock', 'Gloves', 'Robot', 'Statue'], answer: 0, category: 'objects' },
  { question: "What has a head and tail but no body?", options: ['Snake', 'Coin', 'Arrow', 'Comet'], answer: 1, category: 'objects' },
  { question: "What has keys but no locks?", options: ['Piano', 'Map', 'Chest', 'Door'], answer: 0, category: 'objects' },
  { question: "What gets wetter the more it dries?", options: ['Soap', 'Sponge', 'Towel', 'Paper'], answer: 2, category: 'objects' },
  { question: "What can you catch but not throw?", options: ['Ball', 'Cold', 'Fish', 'Frisbee'], answer: 1, category: 'wordplay' },
  { question: "What has a neck but no head?", options: ['Guitar', 'Bottle', 'Shirt', 'Giraffe'], answer: 1, category: 'objects' },
  { question: "What has legs but doesn't walk?", options: ['Spider', 'Table', 'Octopus', 'Caterpillar'], answer: 1, category: 'objects' },
  { question: "What has one eye but can't see?", options: ['Cyclops', 'Pirate', 'Needle', 'Camera'], answer: 2, category: 'objects' },
  { question: "What has teeth but can't bite?", options: ['Shark', 'Comb', 'Saw', 'Zipper'], answer: 1, category: 'objects' },
  { question: "What has ears but can't hear?", options: ['Elephant', 'Corn', 'Rabbit', 'Dog'], answer: 1, category: 'nature' },
  { question: "What runs but never walks?", options: ['Athlete', 'Water', 'Time', 'Horse'], answer: 1, category: 'nature' },
  { question: "What has a bark but no bite?", options: ['Dog', 'Tree', 'Seal', 'Wolf'], answer: 1, category: 'nature' },
  { question: "What has a bed but never sleeps?", options: ['Hotel', 'River', 'Baby', 'Hospital'], answer: 1, category: 'nature' },
  { question: "What has words but never speaks?", options: ['Person', 'Book', 'Teacher', 'Parrot'], answer: 1, category: 'objects' },
  { question: "What goes up but never comes down?", options: ['Balloon', 'Elevator', 'Age', 'Rocket'], answer: 2, category: 'abstract' },
  { question: "What can travel around the world while staying in a corner?", options: ['Airplane', 'Stamp', 'Globe', 'Satellite'], answer: 1, category: 'objects' },
  { question: "What building has the most stories?", options: ['Skyscraper', 'Library', 'School', 'Museum'], answer: 1, category: 'wordplay' },
  { question: "What has a ring but no finger?", options: ['Phone', 'Saturn', 'Wedding', 'Doorbell'], answer: 0, category: 'objects' },
  { question: "What has a face but can't smile?", options: ['Clock', 'Mirror', 'Photo', 'Mask'], answer: 0, category: 'objects' },
  { question: "What breaks when you say its name?", options: ['Glass', 'Promise', 'Silence', 'Secret'], answer: 2, category: 'abstract' },
  { question: "What goes through towns without moving?", options: ['Wind', 'River', 'Road', 'Cloud'], answer: 2, category: 'nature' },
  { question: "What has a thumb and fingers but isn't alive?", options: ['Robot', 'Glove', 'Statue', 'Puppet'], answer: 1, category: 'objects' },
  { question: "What can fill a room but takes no space?", options: ['Air', 'Light', 'Sound', 'Smell'], answer: 1, category: 'nature' },
  { question: "What starts with 'e' and contains only one letter?", options: ['Edge', 'Envelope', 'Eye', 'Ear'], answer: 1, category: 'wordplay' },
  { question: "What has cities but no houses?", options: ['Country', 'Map', 'Planet', 'Continent'], answer: 1, category: 'objects' },
  { question: "What has branches but no leaves?", options: ['Tree', 'Bank', 'River', 'Lightning'], answer: 1, category: 'wordplay' },
  { question: "What has roots nobody sees?", options: ['Tree', 'Hair', 'Teeth', 'Mountain'], answer: 3, category: 'wordplay' },
  { question: "What can be cracked, made, told, and played?", options: ['Joke', 'Game', 'Story', 'Code'], answer: 0, category: 'wordplay' },
  { question: "What belongs to you but others use it more?", options: ['Car', 'Name', 'House', 'Phone'], answer: 1, category: 'abstract' },
  { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", options: ['Time', 'Letter M', 'Chance', 'Second'], answer: 1, category: 'wordplay' },
  { question: "What has four wheels and flies?", options: ['Airplane', 'Garbage truck', 'Helicopter', 'Drone'], answer: 1, category: 'wordplay' },
  { question: "What can you hold without touching?", options: ['Air', 'Breath', 'Thought', 'Water'], answer: 1, category: 'abstract' },
  { question: "What is always in front of you but can't be seen?", options: ['Shadow', 'Future', 'Air', 'Destiny'], answer: 1, category: 'abstract' },
  { question: "What grows when it eats but dies when it drinks?", options: ['Plant', 'Human', 'Fire', 'Bacteria'], answer: 2, category: 'nature' },
  { question: "What has a head, a tail, is brown, and has no legs?", options: ['Snake', 'Penny', 'Worm', 'Caterpillar'], answer: 1, category: 'objects' },
  { question: "What five-letter word becomes shorter when you add two letters?", options: ['Small', 'Short', 'Tiny', 'Brief'], answer: 1, category: 'wordplay' },
  { question: "What word is spelled incorrectly in every dictionary?", options: ['Wrong', 'Error', 'Incorrectly', 'Mistake'], answer: 2, category: 'wordplay' },
  { question: "What can you keep after giving to someone?", options: ['Gift', 'Promise', 'Word', 'Secret'], answer: 2, category: 'abstract' },
  { question: "What has 13 hearts but no other organs?", options: ['Monster', 'Deck of cards', 'Hospital', 'Robot'], answer: 1, category: 'objects' },
  { question: "What can run but never walks, has a mouth but never talks?", options: ['Human', 'River', 'Horse', 'Wind'], answer: 1, category: 'nature' },
  { question: "What is seen in the middle of March and April?", options: ['Spring', 'Easter', 'Letter R', 'Flowers'], answer: 2, category: 'wordplay' },
  { question: "What word in the English language does the following: first two letters signify male, first three letters signify female, first four letters signify great, and the whole word signifies a great woman?", options: ['Hero', 'Heroine', 'Woman', 'She'], answer: 1, category: 'wordplay' },
  { question: "What is so fragile that saying its name breaks it?", options: ['Glass', 'Silence', 'Trust', 'Promise'], answer: 1, category: 'abstract' },
  { question: "What has one head, one foot, and four legs?", options: ['Human', 'Bed', 'Table', 'Chair'], answer: 1, category: 'objects' },
  { question: "What is cut on a table but never eaten?", options: ['Meat', 'Paper', 'Cards', 'Fruit'], answer: 2, category: 'wordplay' },
  { question: "What goes up and down but doesn't move?", options: ['Elevator', 'Staircase', 'Temperature', 'Ball'], answer: 1, category: 'objects' },
  { question: "What type of cheese is made backward?", options: ['Swiss', 'Cheddar', 'Edam', 'Brie'], answer: 2, category: 'wordplay' },
  { question: "What can be broken without being held?", options: ['Glass', 'Promise', 'Heart', 'Record'], answer: 1, category: 'abstract' },
  { question: "What word is always pronounced wrong?", options: ['Pronunciation', 'Incorrectly', 'Wrong', 'Mispronounce'], answer: 2, category: 'wordplay' },
  { question: "If you drop me, I'm sure to crack, but give me a smile and I'll always smile back. What am I?", options: ['Egg', 'Mirror', 'Glass', 'Phone'], answer: 1, category: 'objects' },
].map((r, i) => ({
  ...r,
  gameType: GameType.RIDDLE_ARENA,
  level: i + 1,
  difficulty: i < 20 ? Difficulty.EASY : i < 40 ? Difficulty.MEDIUM : Difficulty.HARD,
}));

// ==========================================
// SPEED MATH CONFIGURATIONS (for multiplayer)
// ==========================================
export const speedMathConfigs = [
  // Easy fundamentals
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 1,
    difficulty: Difficulty.EASY,
    minA: 8,
    maxA: 45 + i,
    minB: 5,
    maxB: 30 + Math.floor(i / 2),
    operations: ['+', '-'],
  })),
  // Medium: larger values and multiplication
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 31,
    difficulty: Difficulty.MEDIUM,
    minA: 30,
    maxA: 140 + i * 2,
    minB: 8,
    maxB: 40 + Math.floor(i / 2),
    operations: ['+', '-', '*'],
  })),
  // Hard: larger ranges with division
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 66,
    difficulty: Difficulty.HARD,
    minA: 70,
    maxA: 300 + i * 4,
    minB: 10,
    maxB: 60 + Math.floor(i / 2),
    operations: ['+', '-', '*', '/'],
  })),
  // Expert: heavy arithmetic pressure
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 101,
    difficulty: Difficulty.EXPERT,
    minA: 120,
    maxA: 480 + i * 8,
    minB: 12,
    maxB: 80 + Math.floor(i / 2),
    operations: ['+', '-', '*', '/'],
  })),
];

// ==========================================
// MEMORY MATCH CONFIGS
// ==========================================
const memoryIcons = [
  '\u{1F34E}', '\u{1F34A}', '\u{1F34B}', '\u{1F347}', '\u{1F353}', '\u{1F352}',
  '\u{1F965}', '\u{1F351}', '\u{1F34C}', '\u{1F96D}', '\u{1F34D}', '\u{1F346}',
  '\u{1F955}', '\u{1F33D}', '\u{1F966}', '\u{1F9C4}', '\u{1F9C5}', '\u{1F954}',
  '\u{1F360}', '\u{1F336}', '\u{1F952}', '\u{1F96C}', '\u{1F951}', '\u{1F345}',
  '\u{1FAD1}', '\u{1FAD2}', '\u{1FAD0}', '\u{1FADB}', '\u{1FADA}', '\u{1F344}',
];

const pickMemoryIcons = (start: number, count: number): string[] =>
  Array.from({ length: count }, (_, index) => memoryIcons[(start + index) % memoryIcons.length]);

export const memoryMatchConfigs = [
  // Easy: 6-7 pairs
  ...Array.from({ length: 30 }, (_, i) => {
    const pairs = 6 + Math.floor(i / 15);
    return {
      gameType: GameType.MEMORY_MATCH_BATTLE,
      level: i + 1,
      difficulty: Difficulty.EASY,
      pairs,
      icons: pickMemoryIcons(i, pairs),
    };
  }),
  // Medium: 8-10 pairs
  ...Array.from({ length: 35 }, (_, i) => {
    const pairs = 8 + Math.floor(i / 12);
    return {
      gameType: GameType.MEMORY_MATCH_BATTLE,
      level: i + 31,
      difficulty: Difficulty.MEDIUM,
      pairs,
      icons: pickMemoryIcons(i + 5, pairs),
    };
  }),
  // Hard: 11-14 pairs
  ...Array.from({ length: 35 }, (_, i) => {
    const pairs = 11 + Math.floor(i / 9);
    return {
      gameType: GameType.MEMORY_MATCH_BATTLE,
      level: i + 66,
      difficulty: Difficulty.HARD,
      pairs,
      icons: pickMemoryIcons(i + 9, pairs),
    };
  }),
  // Expert: 15-18 pairs
  ...Array.from({ length: 20 }, (_, i) => {
    const pairs = 15 + Math.floor(i / 5);
    return {
      gameType: GameType.MEMORY_MATCH_BATTLE,
      level: i + 101,
      difficulty: Difficulty.EXPERT,
      pairs,
      icons: pickMemoryIcons(i + 13, pairs),
    };
  }),
];

// ==========================================
// MEMORY PATH CONFIGS
// ==========================================
export const memoryPathConfigs = [
  // Easy: short paths, smaller board
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 1,
    difficulty: Difficulty.EASY,
    pathLength: 4 + Math.floor(i / 6),
    gridSize: 4,
  })),
  // Medium: longer paths on 5x5
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 31,
    difficulty: Difficulty.MEDIUM,
    pathLength: 7 + Math.floor(i / 5),
    gridSize: 5,
  })),
  // Hard: long paths on 6x6
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 66,
    difficulty: Difficulty.HARD,
    pathLength: 11 + Math.floor(i / 4),
    gridSize: 6,
  })),
  // Expert: maximum pressure
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 101,
    difficulty: Difficulty.EXPERT,
    pathLength: 20 + Math.floor(i / 2),
    gridSize: 6,
  })),
];

// ==========================================
// COLOR MEMORY CONFIGS
// ==========================================
export const colorMemoryConfigs = [
  // Easy: 4 colors, short sequences
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 1,
    difficulty: Difficulty.EASY,
    colorCount: 4,
    initialLength: 3 + Math.floor(i / 5),
  })),
  // Medium: 5 colors
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 31,
    difficulty: Difficulty.MEDIUM,
    colorCount: 5,
    initialLength: 6 + Math.floor(i / 5),
  })),
  // Hard: 6 colors
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 66,
    difficulty: Difficulty.HARD,
    colorCount: 6,
    initialLength: 10 + Math.floor(i / 4),
  })),
  // Expert: very long sequences
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 101,
    difficulty: Difficulty.EXPERT,
    colorCount: 6,
    initialLength: 19 + Math.floor(i / 2),
  })),
];

// ==========================================
// NUMBER PYRAMID CONFIGS
// ==========================================
export const numberPyramidConfigs = [
  // Easy: 4 rows
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 1,
    difficulty: Difficulty.EASY,
    rows: 4,
    maxBaseNumber: 8 + Math.floor(i / 4),
  })),
  // Medium: 5 rows
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 31,
    difficulty: Difficulty.MEDIUM,
    rows: 5,
    maxBaseNumber: 12 + Math.floor(i / 3),
  })),
  // Hard: 6 rows
  ...Array.from({ length: 35 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 66,
    difficulty: Difficulty.HARD,
    rows: 6,
    maxBaseNumber: 17 + Math.floor(i / 3),
  })),
  // Expert: 7 rows
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 101,
    difficulty: Difficulty.EXPERT,
    rows: 7,
    maxBaseNumber: 24 + Math.floor(i / 2),
  })),
];

// ==========================================
// SLIDING PUZZLE CONFIGS
// ==========================================
export const slidingPuzzleConfigs = [
  // Easy: 3x3
  ...Array.from({ length: 25 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 1,
    difficulty: Difficulty.EASY,
    gridSize: 3,
    shuffleMoves: 80 + i * 12,
  })),
  // Medium: 4x4
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 26,
    difficulty: Difficulty.MEDIUM,
    gridSize: 4,
    shuffleMoves: 220 + i * 18,
  })),
  // Hard: 5x5
  ...Array.from({ length: 30 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 56,
    difficulty: Difficulty.HARD,
    gridSize: 5,
    shuffleMoves: 520 + i * 24,
  })),
  // Expert: 6x6
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 86,
    difficulty: Difficulty.EXPERT,
    gridSize: 6,
    shuffleMoves: 950 + i * 35,
  })),
];
// ==========================================
// COMBINE ALL LEVELS
// ==========================================
export const allGameLevels = [
  ...wordConnectLevels,
  ...dailyMysteryWords,
  ...patternSpotterLevels,
  ...riddleArenaLevels,
  ...speedMathConfigs,
  ...memoryMatchConfigs,
  ...memoryPathConfigs,
  ...colorMemoryConfigs,
  ...numberPyramidConfigs,
  ...slidingPuzzleConfigs,
];

