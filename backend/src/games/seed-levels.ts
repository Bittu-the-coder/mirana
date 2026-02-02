import { Difficulty } from './schemas/game-level.schema';
import { GameType } from './schemas/game-score.schema';

// ==========================================
// WORD CONNECT LEVELS (100+ levels)
// ==========================================
export const wordConnectLevels = [
  // Easy levels (1-30)
  { level: 1, difficulty: Difficulty.EASY, letters: ['D', 'O', 'G'], words: ['DOG', 'GOD', 'DO', 'GO'], hint: "Man's best friend" },
  { level: 2, difficulty: Difficulty.EASY, letters: ['C', 'A', 'T'], words: ['CAT', 'ACT', 'AT'], hint: 'Furry pet' },
  { level: 3, difficulty: Difficulty.EASY, letters: ['S', 'U', 'N'], words: ['SUN', 'NUS', 'US'], hint: 'Gives us light' },
  { level: 4, difficulty: Difficulty.EASY, letters: ['R', 'U', 'N'], words: ['RUN', 'URN', 'UN'], hint: 'Move fast' },
  { level: 5, difficulty: Difficulty.EASY, letters: ['B', 'A', 'T'], words: ['BAT', 'TAB', 'AT'], hint: 'Flying mammal' },
  { level: 6, difficulty: Difficulty.EASY, letters: ['H', 'A', 'T'], words: ['HAT', 'AH', 'AT'], hint: 'Wear on head' },
  { level: 7, difficulty: Difficulty.EASY, letters: ['M', 'A', 'N'], words: ['MAN', 'AN', 'AM'], hint: 'Adult male' },
  { level: 8, difficulty: Difficulty.EASY, letters: ['P', 'A', 'N'], words: ['PAN', 'NAP', 'AN'], hint: 'Cooking tool' },
  { level: 9, difficulty: Difficulty.EASY, letters: ['W', 'I', 'N'], words: ['WIN', 'IN'], hint: 'Opposite of lose' },
  { level: 10, difficulty: Difficulty.EASY, letters: ['B', 'U', 'S'], words: ['BUS', 'SUB', 'US'], hint: 'Public transport' },
  { level: 11, difficulty: Difficulty.EASY, letters: ['C', 'U', 'P'], words: ['CUP', 'UP'], hint: 'Drink from it' },
  { level: 12, difficulty: Difficulty.EASY, letters: ['G', 'U', 'M'], words: ['GUM', 'MUG', 'UM'], hint: 'Chew it' },
  { level: 13, difficulty: Difficulty.EASY, letters: ['P', 'E', 'N'], words: ['PEN', 'EN'], hint: 'Writing tool' },
  { level: 14, difficulty: Difficulty.EASY, letters: ['B', 'E', 'D'], words: ['BED', 'DEB'], hint: 'Sleep here' },
  { level: 15, difficulty: Difficulty.EASY, letters: ['L', 'E', 'G'], words: ['LEG', 'GEL', 'EL'], hint: 'Body part' },
  { level: 16, difficulty: Difficulty.EASY, letters: ['E', 'G', 'G'], words: ['EGG', 'GE'], hint: 'Breakfast food' },
  { level: 17, difficulty: Difficulty.EASY, letters: ['S', 'A', 'D'], words: ['SAD', 'ADS', 'AD', 'AS'], hint: 'Unhappy feeling' },
  { level: 18, difficulty: Difficulty.EASY, letters: ['M', 'A', 'D'], words: ['MAD', 'DAM', 'AD', 'AM'], hint: 'Angry' },
  { level: 19, difficulty: Difficulty.EASY, letters: ['B', 'A', 'D'], words: ['BAD', 'DAB', 'AD'], hint: 'Not good' },
  { level: 20, difficulty: Difficulty.EASY, letters: ['R', 'E', 'D'], words: ['RED', 'ERE'], hint: 'Color of apple' },
  { level: 21, difficulty: Difficulty.EASY, letters: ['H', 'E', 'N'], words: ['HEN', 'EN', 'HE'], hint: 'Female chicken' },
  { level: 22, difficulty: Difficulty.EASY, letters: ['P', 'I', 'G'], words: ['PIG', 'GI'], hint: 'Farm animal' },
  { level: 23, difficulty: Difficulty.EASY, letters: ['F', 'I', 'N'], words: ['FIN', 'IF', 'IN'], hint: 'Fish has it' },
  { level: 24, difficulty: Difficulty.EASY, letters: ['J', 'A', 'M'], words: ['JAM', 'AM'], hint: 'Spread on bread' },
  { level: 25, difficulty: Difficulty.EASY, letters: ['G', 'A', 'P'], words: ['GAP', 'PA', 'AG'], hint: 'Empty space' },
  { level: 26, difficulty: Difficulty.EASY, letters: ['Z', 'O', 'O'], words: ['ZOO', 'OO'], hint: 'Animals live here' },
  { level: 27, difficulty: Difficulty.EASY, letters: ['W', 'E', 'T'], words: ['WET', 'TEW', 'WE'], hint: 'Not dry' },
  { level: 28, difficulty: Difficulty.EASY, letters: ['H', 'O', 'T'], words: ['HOT', 'OH', 'TO'], hint: 'High temperature' },
  { level: 29, difficulty: Difficulty.EASY, letters: ['B', 'I', 'G'], words: ['BIG', 'GI'], hint: 'Large' },
  { level: 30, difficulty: Difficulty.EASY, letters: ['D', 'I', 'G'], words: ['DIG', 'GI', 'ID'], hint: 'Make a hole' },

  // Medium levels (31-70)
  { level: 31, difficulty: Difficulty.MEDIUM, letters: ['C', 'A', 'T', 'S'], words: ['CAT', 'CATS', 'SAT', 'ACT', 'ACTS', 'CAST'], hint: 'Furry pets' },
  { level: 32, difficulty: Difficulty.MEDIUM, letters: ['W', 'O', 'R', 'D'], words: ['WORD', 'ROW', 'ROD', 'OWN', 'WORN', 'DOWN'], hint: 'What you read' },
  { level: 33, difficulty: Difficulty.MEDIUM, letters: ['T', 'I', 'M', 'E'], words: ['TIME', 'ITEM', 'EMIT', 'MITE', 'TIE', 'MET'], hint: 'Clock shows this' },
  { level: 34, difficulty: Difficulty.MEDIUM, letters: ['P', 'L', 'A', 'Y'], words: ['PLAY', 'PAL', 'LAY', 'PAY', 'LAP'], hint: 'What kids do' },
  { level: 35, difficulty: Difficulty.MEDIUM, letters: ['S', 'T', 'A', 'R'], words: ['STAR', 'RATS', 'ARTS', 'TAR', 'SAT', 'RAT'], hint: 'Twinkle twinkle' },
  { level: 36, difficulty: Difficulty.MEDIUM, letters: ['H', 'O', 'M', 'E'], words: ['HOME', 'HEM', 'HOE', 'MOE'], hint: 'Where you live' },
  { level: 37, difficulty: Difficulty.MEDIUM, letters: ['L', 'O', 'V', 'E'], words: ['LOVE', 'VOLE', 'OLE', 'LEVO'], hint: 'Strong feeling' },
  { level: 38, difficulty: Difficulty.MEDIUM, letters: ['F', 'I', 'R', 'E'], words: ['FIRE', 'RIFE', 'FIER', 'IRE', 'FIR'], hint: 'Burns hot' },
  { level: 39, difficulty: Difficulty.MEDIUM, letters: ['G', 'A', 'M', 'E'], words: ['GAME', 'MAGE', 'MEGA', 'AGE', 'GEM'], hint: 'Fun activity' },
  { level: 40, difficulty: Difficulty.MEDIUM, letters: ['C', 'A', 'K', 'E'], words: ['CAKE', 'ACE', 'AKE'], hint: 'Birthday treat' },
  { level: 41, difficulty: Difficulty.MEDIUM, letters: ['R', 'I', 'C', 'E'], words: ['RICE', 'ICE', 'IRE', 'ERIC'], hint: 'Asian staple' },
  { level: 42, difficulty: Difficulty.MEDIUM, letters: ['D', 'A', 'R', 'K'], words: ['DARK', 'ARK', 'RAD'], hint: 'No light' },
  { level: 43, difficulty: Difficulty.MEDIUM, letters: ['L', 'I', 'N', 'K'], words: ['LINK', 'INK', 'KIN', 'NIL'], hint: 'Connection' },
  { level: 44, difficulty: Difficulty.MEDIUM, letters: ['W', 'A', 'V', 'E'], words: ['WAVE', 'AWE', 'AVE', 'EVA', 'WAV'], hint: 'Ocean motion' },
  { level: 45, difficulty: Difficulty.MEDIUM, letters: ['B', 'E', 'A', 'R'], words: ['BEAR', 'BARE', 'BRAE', 'ARE', 'EAR', 'ERA'], hint: 'Forest animal' },
  { level: 46, difficulty: Difficulty.MEDIUM, letters: ['P', 'A', 'R', 'K'], words: ['PARK', 'PAR', 'RAP', 'ARK'], hint: 'Green space' },
  { level: 47, difficulty: Difficulty.MEDIUM, letters: ['R', 'O', 'A', 'D'], words: ['ROAD', 'OAR', 'ROD', 'ADO', 'RAD'], hint: 'Cars drive here' },
  { level: 48, difficulty: Difficulty.MEDIUM, letters: ['T', 'R', 'E', 'E'], words: ['TREE', 'TEER', 'ERE', 'TEE', 'RET'], hint: 'Has leaves' },
  { level: 49, difficulty: Difficulty.MEDIUM, letters: ['K', 'I', 'N', 'G'], words: ['KING', 'KIN', 'INK', 'GIN'], hint: 'Royal male' },
  { level: 50, difficulty: Difficulty.MEDIUM, letters: ['R', 'I', 'N', 'G'], words: ['RING', 'GRIN', 'RIG', 'GIN'], hint: 'Wear on finger' },
  { level: 51, difficulty: Difficulty.MEDIUM, letters: ['S', 'I', 'N', 'G'], words: ['SING', 'SIGN', 'SIN', 'GIN', 'INS'], hint: 'Use voice for music' },
  { level: 52, difficulty: Difficulty.MEDIUM, letters: ['W', 'I', 'N', 'G'], words: ['WING', 'WIN', 'WIG', 'GIN'], hint: 'Birds have two' },
  { level: 53, difficulty: Difficulty.MEDIUM, letters: ['B', 'O', 'N', 'E'], words: ['BONE', 'BOON', 'ONE', 'EON', 'NOB'], hint: 'Inside body' },
  { level: 54, difficulty: Difficulty.MEDIUM, letters: ['Z', 'O', 'N', 'E'], words: ['ZONE', 'ONE', 'EON', 'ZEN'], hint: 'Area or region' },
  { level: 55, difficulty: Difficulty.MEDIUM, letters: ['C', 'O', 'N', 'E'], words: ['CONE', 'ONCE', 'ONE', 'EON', 'CON'], hint: 'Ice cream holder' },
  { level: 56, difficulty: Difficulty.MEDIUM, letters: ['L', 'I', 'F', 'E'], words: ['LIFE', 'FILE', 'LIE', 'FIE', 'ELF'], hint: 'Living' },
  { level: 57, difficulty: Difficulty.MEDIUM, letters: ['W', 'I', 'F', 'E'], words: ['WIFE', 'WIF', 'FIE', 'WE'], hint: 'Married woman' },
  { level: 58, difficulty: Difficulty.MEDIUM, letters: ['G', 'I', 'F', 'T'], words: ['GIFT', 'FIG', 'FIT', 'GIT'], hint: 'Present' },
  { level: 59, difficulty: Difficulty.MEDIUM, letters: ['L', 'I', 'F', 'T'], words: ['LIFT', 'FLIT', 'LIT', 'FIT'], hint: 'Raise up' },
  { level: 60, difficulty: Difficulty.MEDIUM, letters: ['S', 'H', 'I', 'P'], words: ['SHIP', 'HIPS', 'HIP', 'SIP', 'HIS'], hint: 'Sails the sea' },
  { level: 61, difficulty: Difficulty.MEDIUM, letters: ['C', 'H', 'I', 'P'], words: ['CHIP', 'HIP', 'HIC', 'PIC'], hint: 'Potato snack' },
  { level: 62, difficulty: Difficulty.MEDIUM, letters: ['W', 'H', 'I', 'P'], words: ['WHIP', 'HIP', 'WIP'], hint: 'Cream topping' },
  { level: 63, difficulty: Difficulty.MEDIUM, letters: ['G', 'R', 'I', 'P'], words: ['GRIP', 'GRIT', 'RIP', 'RIG', 'PIG'], hint: 'Hold tight' },
  { level: 64, difficulty: Difficulty.MEDIUM, letters: ['D', 'R', 'I', 'P'], words: ['DRIP', 'RIP', 'RID', 'DIP'], hint: 'Water drops' },
  { level: 65, difficulty: Difficulty.MEDIUM, letters: ['T', 'R', 'I', 'P'], words: ['TRIP', 'TRAP', 'RIP', 'TIP', 'PIT'], hint: 'Journey' },
  { level: 66, difficulty: Difficulty.MEDIUM, letters: ['S', 'N', 'O', 'W'], words: ['SNOW', 'SOWN', 'NOW', 'OWN', 'SON', 'WON'], hint: 'Winter white' },
  { level: 67, difficulty: Difficulty.MEDIUM, letters: ['S', 'H', 'O', 'W'], words: ['SHOW', 'HOWS', 'HOW', 'SOW', 'WHO'], hint: 'Display' },
  { level: 68, difficulty: Difficulty.MEDIUM, letters: ['G', 'L', 'O', 'W'], words: ['GLOW', 'GLOB', 'LOG', 'LOW', 'OWL'], hint: 'Shine softly' },
  { level: 69, difficulty: Difficulty.MEDIUM, letters: ['F', 'L', 'O', 'W'], words: ['FLOW', 'FOWL', 'LOW', 'OWL', 'FLU'], hint: 'Stream movement' },
  { level: 70, difficulty: Difficulty.MEDIUM, letters: ['G', 'R', 'O', 'W'], words: ['GROW', 'ROW', 'OWE', 'WOE', 'GOT'], hint: 'Get bigger' },

  // Hard levels (71-100)
  { level: 71, difficulty: Difficulty.HARD, letters: ['L', 'I', 'G', 'H', 'T'], words: ['LIGHT', 'GILT', 'HILT', 'HIT', 'LIT', 'GIT'], hint: 'Opposite of dark' },
  { level: 72, difficulty: Difficulty.HARD, letters: ['N', 'I', 'G', 'H', 'T'], words: ['NIGHT', 'THING', 'THIN', 'HINT', 'GIN', 'NIT'], hint: 'Dark hours' },
  { level: 73, difficulty: Difficulty.HARD, letters: ['R', 'I', 'G', 'H', 'T'], words: ['RIGHT', 'GIRTH', 'GRIT', 'TIGHT', 'HIT', 'RIG'], hint: 'Not wrong' },
  { level: 74, difficulty: Difficulty.HARD, letters: ['F', 'I', 'G', 'H', 'T'], words: ['FIGHT', 'GIFT', 'FIG', 'FIT', 'HIT', 'GIT'], hint: 'Battle' },
  { level: 75, difficulty: Difficulty.HARD, letters: ['S', 'I', 'G', 'H', 'T'], words: ['SIGHT', 'GIST', 'HITS', 'HIT', 'SIT', 'GIT'], hint: 'Vision' },
  { level: 76, difficulty: Difficulty.HARD, letters: ['B', 'R', 'I', 'D', 'E'], words: ['BRIDE', 'BIRD', 'BRIE', 'RIDE', 'RIB', 'BID', 'RID'], hint: 'Wedding woman' },
  { level: 77, difficulty: Difficulty.HARD, letters: ['P', 'R', 'I', 'D', 'E'], words: ['PRIDE', 'DRIP', 'RIPE', 'RIDE', 'PIE', 'RIP', 'RED'], hint: 'Self-respect' },
  { level: 78, difficulty: Difficulty.HARD, letters: ['G', 'R', 'A', 'P', 'E'], words: ['GRAPE', 'GAPE', 'PAGE', 'RAGE', 'REAP', 'PEAR', 'GEAR', 'AGE'], hint: 'Wine fruit' },
  { level: 79, difficulty: Difficulty.HARD, letters: ['S', 'P', 'A', 'C', 'E'], words: ['SPACE', 'PACE', 'ACES', 'CAPE', 'CAPS', 'CASE', 'ACE', 'SPA'], hint: 'Outer cosmos' },
  { level: 80, difficulty: Difficulty.HARD, letters: ['P', 'L', 'A', 'C', 'E'], words: ['PLACE', 'LACE', 'PALE', 'CLAP', 'LEAP', 'PEAL', 'CAP', 'LAP'], hint: 'Location' },
  { level: 81, difficulty: Difficulty.HARD, letters: ['T', 'R', 'A', 'C', 'E'], words: ['TRACE', 'CRATE', 'REACT', 'CARE', 'RACE', 'TEAR', 'ACE', 'ARC'], hint: 'Follow a path' },
  { level: 82, difficulty: Difficulty.HARD, letters: ['G', 'R', 'A', 'C', 'E'], words: ['GRACE', 'RACER', 'CAGE', 'CARE', 'RACE', 'ACRE', 'AGE', 'ARC'], hint: 'Elegance' },
  { level: 83, difficulty: Difficulty.HARD, letters: ['B', 'R', 'A', 'C', 'E'], words: ['BRACE', 'CRAB', 'CARE', 'RACE', 'BEAR', 'BARE', 'ACE', 'ARC'], hint: 'Support' },
  { level: 84, difficulty: Difficulty.HARD, letters: ['W', 'A', 'T', 'E', 'R'], words: ['WATER', 'WART', 'WEAR', 'TEAR', 'RATE', 'WATE', 'ATE', 'EAT', 'TAR'], hint: 'H2O' },
  { level: 85, difficulty: Difficulty.HARD, letters: ['E', 'A', 'R', 'T', 'H'], words: ['EARTH', 'HEART', 'HATER', 'HEAT', 'HATE', 'RATE', 'EAT', 'TAR', 'ARE'], hint: 'Our planet' },
  { level: 86, difficulty: Difficulty.HARD, letters: ['H', 'E', 'A', 'R', 'T'], words: ['HEART', 'EARTH', 'HATER', 'HEAT', 'TEAR', 'RATE', 'EAT', 'TAR', 'HAT'], hint: 'Love organ' },
  { level: 87, difficulty: Difficulty.HARD, letters: ['S', 'M', 'A', 'R', 'T'], words: ['SMART', 'MARTS', 'TRAMS', 'ARTS', 'MARS', 'RATS', 'TAR', 'SAT', 'MAT'], hint: 'Clever' },
  { level: 88, difficulty: Difficulty.HARD, letters: ['S', 'T', 'A', 'R', 'T'], words: ['START', 'TARTS', 'RATS', 'ARTS', 'TART', 'STAT', 'TAR', 'SAT', 'RAT'], hint: 'Begin' },
  { level: 89, difficulty: Difficulty.HARD, letters: ['S', 'T', 'O', 'R', 'M'], words: ['STORM', 'SPORT', 'MOST', 'SORT', 'TOMS', 'ROTS', 'MOT', 'ROT', 'TOM'], hint: 'Bad weather' },
  { level: 90, difficulty: Difficulty.HARD, letters: ['S', 'T', 'O', 'R', 'Y'], words: ['STORY', 'ROSY', 'TOYS', 'SORT', 'ROTS', 'TORY', 'TOY', 'ROT', 'TRY'], hint: 'Tale' },
  { level: 91, difficulty: Difficulty.HARD, letters: ['D', 'R', 'E', 'A', 'M'], words: ['DREAM', 'ARMED', 'DRAM', 'MADE', 'READ', 'MARE', 'DAM', 'MAD', 'RED'], hint: 'Sleep vision' },
  { level: 92, difficulty: Difficulty.HARD, letters: ['S', 'T', 'E', 'A', 'M'], words: ['STEAM', 'MEATS', 'TEAMS', 'MEAT', 'MATE', 'SEAT', 'SAT', 'EAT', 'MET'], hint: 'Hot water vapor' },
  { level: 93, difficulty: Difficulty.HARD, letters: ['C', 'R', 'E', 'A', 'M'], words: ['CREAM', 'RACER', 'CARE', 'RACE', 'MARE', 'ACRE', 'CAR', 'ARC', 'EAR'], hint: 'In coffee' },
  { level: 94, difficulty: Difficulty.HARD, letters: ['S', 'C', 'O', 'R', 'E'], words: ['SCORE', 'CORES', 'CORSE', 'CORE', 'ROSE', 'SORE', 'COR', 'ORE', 'ROE'], hint: 'Game points' },
  { level: 95, difficulty: Difficulty.HARD, letters: ['S', 'T', 'O', 'N', 'E'], words: ['STONE', 'NOTES', 'TONES', 'TONE', 'NOTE', 'SENT', 'NOT', 'ONE', 'TON'], hint: 'Rock' },
  { level: 96, difficulty: Difficulty.HARD, letters: ['P', 'H', 'O', 'N', 'E'], words: ['PHONE', 'HONE', 'HOPE', 'PONE', 'OPEN', 'PEON', 'ONE', 'HOP', 'PEN'], hint: 'Call device' },
  { level: 97, difficulty: Difficulty.HARD, letters: ['M', 'O', 'N', 'E', 'Y'], words: ['MONEY', 'ENEMY', 'MOON', 'OMEN', 'NOME', 'MONO', 'MEN', 'ONE', 'YEN'], hint: 'Currency' },
  { level: 98, difficulty: Difficulty.HARD, letters: ['H', 'O', 'N', 'E', 'Y'], words: ['HONEY', 'HONE', 'HONE', 'NONE', 'HYENA', 'HEN', 'ONE', 'YEN', 'HON'], hint: 'Bee product' },
  { level: 99, difficulty: Difficulty.HARD, letters: ['W', 'O', 'R', 'L', 'D'], words: ['WORLD', 'ROWLD', 'WORD', 'LORD', 'OLD', 'OWL', 'ROW', 'LOW', 'ROD'], hint: 'Earth globe' },
  { level: 100, difficulty: Difficulty.HARD, letters: ['P', 'O', 'W', 'E', 'R'], words: ['POWER', 'ROWER', 'PROW', 'ROPE', 'WORE', 'PORE', 'OWE', 'ROW', 'POW'], hint: 'Strength' },

  // Expert levels (101-120)
  { level: 101, difficulty: Difficulty.EXPERT, letters: ['F', 'R', 'I', 'E', 'N', 'D'], words: ['FRIEND', 'FINDER', 'FIRED', 'FRIED', 'FINE', 'FIND', 'REIN', 'DIRE', 'FERN'], hint: 'Buddy' },
  { level: 102, difficulty: Difficulty.EXPERT, letters: ['C', 'H', 'A', 'N', 'G', 'E'], words: ['CHANGE', 'CHANCE', 'HANG', 'EACH', 'CAGE', 'ACHE', 'AGE', 'CAN', 'HEN'], hint: 'Transform' },
  { level: 103, difficulty: Difficulty.EXPERT, letters: ['S', 'T', 'R', 'O', 'N', 'G'], words: ['STRONG', 'TONGS', 'GONGS', 'SONGS', 'SORT', 'TORN', 'NOT', 'GOT', 'ROT'], hint: 'Powerful' },
  { level: 104, difficulty: Difficulty.EXPERT, letters: ['S', 'P', 'R', 'I', 'N', 'G'], words: ['SPRING', 'RINGS', 'GRINS', 'PRIGS', 'SING', 'RING', 'SPIN', 'GRIN', 'RIP'], hint: 'Season' },
  { level: 105, difficulty: Difficulty.EXPERT, letters: ['T', 'H', 'I', 'N', 'G', 'S'], words: ['THINGS', 'NIGHTS', 'SITING', 'THING', 'SIGHT', 'NIGHT', 'HINT', 'THIS', 'HIT'], hint: 'Objects' },
  { level: 106, difficulty: Difficulty.EXPERT, letters: ['P', 'L', 'A', 'N', 'E', 'T'], words: ['PLANET', 'PLATEN', 'PLANT', 'PLANE', 'PLATE', 'LEANT', 'PETAL', 'PLAN', 'LANE'], hint: 'Earth or Mars' },
  { level: 107, difficulty: Difficulty.EXPERT, letters: ['G', 'A', 'R', 'D', 'E', 'N'], words: ['GARDEN', 'RANGED', 'DANGER', 'GRAND', 'GRADE', 'ANGER', 'RANGE', 'DEAR', 'NEAR'], hint: 'Flowers grow here' },
  { level: 108, difficulty: Difficulty.EXPERT, letters: ['W', 'I', 'N', 'T', 'E', 'R'], words: ['WINTER', 'WRITER', 'TWINER', 'INTER', 'WRITE', 'INERT', 'TWIN', 'WINE', 'WIRE'], hint: 'Cold season' },
  { level: 109, difficulty: Difficulty.EXPERT, letters: ['S', 'U', 'M', 'M', 'E', 'R'], words: ['SUMMER', 'RUMMERS', 'MUSER', 'RUM', 'SUM', 'USE', 'RUE', 'MUM'], hint: 'Hot season' },
  { level: 110, difficulty: Difficulty.EXPERT, letters: ['A', 'U', 'T', 'U', 'M', 'N'], words: ['AUTUMN', 'MUTANT', 'AUNT', 'TUNA', 'MANNA', 'NUT', 'TAN', 'MAN'], hint: 'Fall season' },
].map(l => ({ ...l, gameType: GameType.WORD_CONNECT }));

// ==========================================
// DAILY MYSTERY WORDS (365+ words)
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

export const dailyMysteryWords = dailyWordsRaw.map((word, index) => ({
  gameType: GameType.DAILY_MYSTERY_WORD,
  level: index + 1,
  word: word.toUpperCase(),
  difficulty: index < 100 ? Difficulty.EASY : index < 200 ? Difficulty.MEDIUM : Difficulty.HARD,
}));

// ==========================================
// PATTERN SPOTTER LEVELS (100+ patterns)
// ==========================================
function generatePatternLevels() {
  const levels: any[] = [];
  let levelNum = 1;

  // Arithmetic sequences (50 levels)
  for (let i = 0; i < 50; i++) {
    const start = Math.floor(Math.random() * 20) + 1;
    const diff = Math.floor(Math.random() * 10) + 1;
    const sequence = Array.from({ length: 4 }, (_, j) => start + diff * j);
    const answer = start + diff * 4;
    const options = [answer, answer + 1, answer - 1, answer + diff].sort(() => Math.random() - 0.5);

    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 15 ? Difficulty.EASY : i < 35 ? Difficulty.MEDIUM : Difficulty.HARD,
      sequence,
      answer,
      options,
      patternType: 'arithmetic',
    });
  }

  // Geometric sequences (30 levels)
  for (let i = 0; i < 30; i++) {
    const start = Math.floor(Math.random() * 5) + 1;
    const ratio = Math.floor(Math.random() * 3) + 2;
    const sequence = Array.from({ length: 4 }, (_, j) => start * Math.pow(ratio, j));
    const answer = start * Math.pow(ratio, 4);
    const options = [answer, answer + ratio, answer - ratio, answer * 2].sort(() => Math.random() - 0.5);

    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: i < 10 ? Difficulty.MEDIUM : Difficulty.HARD,
      sequence,
      answer,
      options,
      patternType: 'geometric',
    });
  }

  // Square numbers (20 levels)
  for (let i = 0; i < 20; i++) {
    const start = Math.floor(Math.random() * 5) + 1;
    const sequence = Array.from({ length: 4 }, (_, j) => (start + j) * (start + j));
    const answer = (start + 4) * (start + 4);
    const options = [answer, answer + 1, (start + 3) * (start + 3) + 2, answer - 2].sort(() => Math.random() - 0.5);

    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: Difficulty.HARD,
      sequence,
      answer,
      options,
      patternType: 'squares',
    });
  }

  // Fibonacci-like (10 levels)
  for (let i = 0; i < 10; i++) {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const sequence = [a, b, a + b, a + 2 * b];
    const answer = 2 * a + 3 * b;
    const options = [answer, answer + 1, answer - 1, answer + 2].sort(() => Math.random() - 0.5);

    levels.push({
      gameType: GameType.PATTERN_SPOTTER,
      level: levelNum++,
      difficulty: Difficulty.EXPERT,
      sequence,
      answer,
      options,
      patternType: 'fibonacci',
    });
  }

  return levels;
}

export const patternSpotterLevels = generatePatternLevels();

// ==========================================
// RIDDLE ARENA (100+ riddles for multiplayer)
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
  // Easy: Single digit addition/subtraction
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 1,
    difficulty: Difficulty.EASY,
    minA: 1, maxA: 10,
    minB: 1, maxB: 10,
    operations: ['+', '-'],
  })),
  // Medium: Double digit, includes multiplication
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 11,
    difficulty: Difficulty.MEDIUM,
    minA: 10, maxA: 50,
    minB: 1, maxB: 20,
    operations: ['+', '-', '*'],
  })),
  // Hard: Larger numbers
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SPEED_MATH_DUEL,
    level: i + 21,
    difficulty: Difficulty.HARD,
    minA: 20, maxA: 100,
    minB: 1, maxB: 30,
    operations: ['+', '-', '*'],
  })),
];

// ==========================================
// MEMORY MATCH CONFIGS
// ==========================================
const memoryIcons = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🍌', '🥭', '🍍', '🥥', '🍆', '🥕', '🌽', '🥦', '🧄', '🧅', '🥔', '🍠', '🌶️', '🥒', '🥬', '🥑', '🍅', '🫑', '🫒', '🫐', '🫛', '🫚'];

export const memoryMatchConfigs = [
  // Easy: 4 pairs (8 cards)
  ...Array.from({ length: 15 }, (_, i) => ({
    gameType: GameType.MEMORY_MATCH_BATTLE,
    level: i + 1,
    difficulty: Difficulty.EASY,
    pairs: 4,
    icons: memoryIcons.slice(0, 4),
  })),
  // Medium: 6 pairs (12 cards)
  ...Array.from({ length: 15 }, (_, i) => ({
    gameType: GameType.MEMORY_MATCH_BATTLE,
    level: i + 16,
    difficulty: Difficulty.MEDIUM,
    pairs: 6,
    icons: memoryIcons.slice(0, 6),
  })),
  // Hard: 8 pairs (16 cards)
  ...Array.from({ length: 15 }, (_, i) => ({
    gameType: GameType.MEMORY_MATCH_BATTLE,
    level: i + 31,
    difficulty: Difficulty.HARD,
    pairs: 8,
    icons: memoryIcons.slice(0, 8),
  })),
  // Expert: 10 pairs (20 cards)
  ...Array.from({ length: 5 }, (_, i) => ({
    gameType: GameType.MEMORY_MATCH_BATTLE,
    level: i + 46,
    difficulty: Difficulty.EXPERT,
    pairs: 10,
    icons: memoryIcons.slice(0, 10),
  })),
];

// ==========================================
// MEMORY PATH CONFIGS
// ==========================================
export const memoryPathConfigs = [
  // Easy: 3-4 cells
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 1,
    difficulty: Difficulty.EASY,
    pathLength: 3 + Math.floor(i / 10),
    gridSize: 4,
  })),
  // Medium: 5-6 cells
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 21,
    difficulty: Difficulty.MEDIUM,
    pathLength: 5 + Math.floor(i / 10),
    gridSize: 5,
  })),
  // Hard: 7-8 cells
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.MEMORY_PATH,
    level: i + 41,
    difficulty: Difficulty.HARD,
    pathLength: 7 + Math.floor(i / 5),
    gridSize: 6,
  })),
];

// ==========================================
// COLOR MEMORY CONFIGS
// ==========================================
export const colorMemoryConfigs = [
  // Easy: 4 colors, short sequences
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 1,
    difficulty: Difficulty.EASY,
    colorCount: 4,
    initialLength: 2 + Math.floor(i / 5),
  })),
  // Medium: 5 colors
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 21,
    difficulty: Difficulty.MEDIUM,
    colorCount: 5,
    initialLength: 3 + Math.floor(i / 5),
  })),
  // Hard: 6 colors
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.COLOR_MEMORY,
    level: i + 41,
    difficulty: Difficulty.HARD,
    colorCount: 6,
    initialLength: 4 + Math.floor(i / 5),
  })),
];

// ==========================================
// NUMBER PYRAMID CONFIGS
// ==========================================
export const numberPyramidConfigs = [
  // Easy: 4 rows
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 1,
    difficulty: Difficulty.EASY,
    rows: 4,
    maxBaseNumber: 5 + Math.floor(i / 4),
  })),
  // Medium: 5 rows
  ...Array.from({ length: 20 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 21,
    difficulty: Difficulty.MEDIUM,
    rows: 5,
    maxBaseNumber: 6 + Math.floor(i / 4),
  })),
  // Hard: 6 rows
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.NUMBER_PYRAMID,
    level: i + 41,
    difficulty: Difficulty.HARD,
    rows: 6,
    maxBaseNumber: 7 + Math.floor(i / 4),
  })),
];

// ==========================================
// SLIDING PUZZLE CONFIGS
// ==========================================
export const slidingPuzzleConfigs = [
  // Easy: 3x3
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 1,
    difficulty: Difficulty.EASY,
    gridSize: 3,
    shuffleMoves: 50 + i * 10,
  })),
  // Medium: 4x4
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 11,
    difficulty: Difficulty.MEDIUM,
    gridSize: 4,
    shuffleMoves: 100 + i * 15,
  })),
  // Hard: 5x5
  ...Array.from({ length: 10 }, (_, i) => ({
    gameType: GameType.SLIDING_PUZZLE,
    level: i + 21,
    difficulty: Difficulty.HARD,
    gridSize: 5,
    shuffleMoves: 150 + i * 20,
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
