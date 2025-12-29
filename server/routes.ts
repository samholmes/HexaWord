import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { HexCell } from "@shared/schema";

const WORDS_POOL = [
  // Technology
  "REACT", "TYPESCRIPT", "NODE", "EXPRESS", "VITE", 
  "TAILWIND", "DRIZZLE", "POSTGRES", "REPLIT", "CODING", 
  "DEBUG", "DEPLOY", "COMPONENT", "HOOK", "STATE",
  "JAVASCRIPT", "PYTHON", "JAVA", "DATABASE", "NETWORK",
  "SERVER", "CLIENT", "API", "CACHE", "QUERY",
  "FUNCTION", "VARIABLE", "COMPILE", "RUNTIME", "KERNEL",
  "BROWSER", "SOFTWARE", "HARDWARE", "MEMORY", "PROCESSOR",
  "ALGORITHM", "BINARY", "BOOLEAN", "CLOUD", "CRYPTO",
  "CURSOR", "DIGITAL", "DOMAIN", "ENCRYPT", "FIREWALL",
  "GATEWAY", "GITHUB", "HACKER", "HTTPS", "INDEX",
  "ITERATE", "JSON", "LINUX", "MACRO", "MODULE",
  "NGINX", "OBJECT", "PACKET", "PIXEL", "PROTOCOL",
  "PROXY", "ROUTER", "SCHEMA", "SCRIPT", "SOCKET",
  "SYNTAX", "TERMINAL", "TOKEN", "UPLOAD", "VIRTUAL",
  "WEBPACK", "WIDGET", "XPATH", "YAML", "ZIPFILE",
  
  // Animals
  "LION", "TIGER", "ELEPHANT", "BEAR", "WOLF",
  "EAGLE", "PENGUIN", "DOLPHIN", "SHARK", "WHALE",
  "ZEBRA", "GIRAFFE", "MONKEY", "RABBIT", "DEER",
  "SNAKE", "TURTLE", "FISH", "BIRD", "CAT",
  "DOG", "HORSE", "COW", "PIG", "SHEEP",
  "PANDA", "KOALA", "OTTER", "FOX", "BADGER",
  "GORILLA", "CHEETAH", "LEOPARD", "JAGUAR", "HYENA",
  "BUFFALO", "RHINO", "HIPPO", "CROCODILE", "ALLIGATOR",
  "PARROT", "FALCON", "HAWK", "OWL", "RAVEN",
  "SPARROW", "ROBIN", "FINCH", "SWAN", "DUCK",
  "GOOSE", "PEACOCK", "FLAMINGO", "PELICAN", "SEAGULL",
  "OCTOPUS", "SQUID", "LOBSTER", "CRAB", "SHRIMP",
  "SALMON", "TUNA", "TROUT", "BASS", "COD",
  "FROG", "TOAD", "GECKO", "IGUANA", "CHAMELEON",
  "COBRA", "PYTHON", "VIPER", "MAMBA", "ANACONDA",
  "ANT", "BEE", "WASP", "BEETLE", "BUTTERFLY",
  "MOTH", "SPIDER", "SCORPION", "MANTIS", "CRICKET",
  "SQUIRREL", "CHIPMUNK", "BEAVER", "RACCOON", "SKUNK",
  "MOOSE", "ELK", "ANTELOPE", "GAZELLE", "BISON",
  
  // Food & Drink
  "APPLE", "BANANA", "ORANGE", "GRAPE", "LEMON",
  "BREAD", "CHEESE", "BUTTER", "MILK", "YOGURT",
  "PIZZA", "PASTA", "RICE", "BEANS", "CORN",
  "CARROT", "ONION", "GARLIC", "LETTUCE", "TOMATO",
  "MEAT", "CHICKEN", "BEEF", "PORK",
  "CHOCOLATE", "COOKIE", "CAKE", "CANDY", "COFFEE",
  "TEA", "JUICE", "WATER", "WINE", "BEER",
  "MANGO", "PAPAYA", "PEACH", "PLUM", "CHERRY",
  "MELON", "KIWI", "LIME", "COCONUT", "PINEAPPLE",
  "AVOCADO", "PEPPER", "SPINACH", "BROCCOLI", "CABBAGE",
  "CELERY", "POTATO", "EGGPLANT", "ZUCCHINI", "RADISH",
  "BACON", "SAUSAGE", "STEAK", "LAMB", "TURKEY",
  "SHRIMP", "SALMON", "LOBSTER", "OYSTER", "CLAM",
  "BURGER", "HOTDOG", "TACO", "BURRITO", "NACHOS",
  "SUSHI", "RAMEN", "CURRY", "SOUP", "SALAD",
  "WAFFLE", "PANCAKE", "MUFFIN", "DONUT", "BROWNIE",
  "PUDDING", "CUSTARD", "ICECREAM", "GELATO", "SORBET",
  "ESPRESSO", "LATTE", "MOCHA", "CIDER", "SMOOTHIE",
  
  // Nature & Geography
  "MOUNTAIN", "FOREST", "RIVER", "OCEAN", "DESERT",
  "BEACH", "ISLAND", "VALLEY", "CANYON", "GLACIER",
  "VOLCANO", "LAKE", "POND", "CREEK", "WATERFALL",
  "TREE", "FLOWER", "GRASS", "MOSS", "FERN",
  "SUN", "MOON", "STAR", "CLOUD", "RAIN",
  "SNOW", "WIND", "STORM", "THUNDER", "LIGHTNING",
  "JUNGLE", "SWAMP", "MARSH", "MEADOW", "PRAIRIE",
  "CLIFF", "CAVE", "GORGE", "PLATEAU", "RIDGE",
  "REEF", "BAY", "HARBOR", "LAGOON", "STRAIT",
  "TUNDRA", "SAVANNA", "STEPPE", "OASIS", "DUNE",
  "BOULDER", "PEBBLE", "GRAVEL", "SAND", "CLAY",
  "OAK", "PINE", "MAPLE", "BIRCH", "WILLOW",
  "PALM", "CEDAR", "BAMBOO", "CYPRESS", "SEQUOIA",
  "ROSE", "TULIP", "LILY", "DAISY", "ORCHID",
  "VIOLET", "POPPY", "IRIS", "LOTUS", "JASMINE",
  "COMET", "METEOR", "ASTEROID", "NEBULA", "GALAXY",
  "PLANET", "SATURN", "VENUS", "MARS", "JUPITER",
  
  // Sports
  "SOCCER", "FOOTBALL", "BASKETBALL", "BASEBALL", "TENNIS",
  "HOCKEY", "RUGBY", "CRICKET", "GOLF", "BOWLING",
  "SWIMMING", "RUNNING", "JUMPING", "SKIING", "BOXING",
  "WRESTLING", "ARCHERY", "CYCLING", "SKATING", "CLIMBING",
  "VOLLEYBALL", "BADMINTON", "LACROSSE", "HANDBALL", "POLO",
  "SURFING", "DIVING", "KAYAKING", "ROWING", "SAILING",
  "FENCING", "KARATE", "JUDO", "TAEKWONDO", "KICKBOXING",
  "MARATHON", "SPRINT", "HURDLES", "JAVELIN", "DISCUS",
  "GYMNAST", "TRAMPOLINE", "YOGA", "PILATES", "AEROBICS",
  "DARTS", "BILLIARDS", "POKER", "CHESS", "CHECKERS",
  
  // Colors
  "RED", "BLUE", "GREEN", "YELLOW", "ORANGE",
  "PURPLE", "PINK", "BROWN", "BLACK", "WHITE",
  "GRAY", "SILVER", "GOLD", "CYAN", "MAGENTA",
  "CRIMSON", "SCARLET", "MAROON", "CORAL", "SALMON",
  "AMBER", "BRONZE", "COPPER", "RUST", "BEIGE",
  "IVORY", "CREAM", "PEARL", "AZURE", "COBALT",
  "NAVY", "INDIGO", "VIOLET", "LAVENDER", "MAUVE",
  "EMERALD", "JADE", "OLIVE", "LIME", "MINT",
  "TEAL", "TURQUOISE", "AQUA", "CHARCOAL", "EBONY",
  
  // Body Parts
  "HEAD", "HAND", "FOOT", "HEART", "BRAIN",
  "EYES", "EARS", "NOSE", "MOUTH", "TEETH",
  "ARM", "LEG", "BACK", "CHEST", "STOMACH",
  "FINGER", "THUMB", "TOE", "NAIL", "BONE",
  "SKULL", "SPINE", "RIB", "PELVIS", "KNEE",
  "ELBOW", "WRIST", "ANKLE", "SHOULDER", "HIP",
  "TONGUE", "THROAT", "LUNG", "LIVER", "KIDNEY",
  "MUSCLE", "TENDON", "JOINT", "SKIN", "VEIN",
  
  // Objects & Tools
  "HAMMER", "KNIFE", "FORK", "SPOON", "PLATE",
  "CHAIR", "TABLE", "DOOR", "WINDOW", "WALL",
  "LAMP", "MIRROR", "CLOCK", "BOOK", "PENCIL",
  "PEN", "PAPER", "PAINT", "BRUSH", "ROPE",
  "BALL", "TOY", "DOLL", "PUZZLE", "GAME",
  "WRENCH", "SCREWDRIVER", "DRILL", "SAW", "PLIERS",
  "SHOVEL", "RAKE", "HOE", "AXE", "CHISEL",
  "NEEDLE", "THREAD", "SCISSORS", "ZIPPER", "BUTTON",
  "PILLOW", "BLANKET", "CURTAIN", "CARPET", "RUG",
  "VASE", "CANDLE", "FRAME", "SHELF", "DRAWER",
  "KETTLE", "TOASTER", "BLENDER", "MIXER", "OVEN",
  "FRIDGE", "STOVE", "SINK", "FAUCET", "DRAIN",
  "CAMERA", "PHONE", "TABLET", "LAPTOP", "KEYBOARD",
  "MOUSE", "MONITOR", "SPEAKER", "HEADPHONES", "CHARGER",
  "UMBRELLA", "WALLET", "PURSE", "BACKPACK", "SUITCASE",
  
  // Professions
  "DOCTOR", "NURSE", "TEACHER", "LAWYER", "ENGINEER",
  "ARTIST", "ACTOR", "SINGER", "DANCER", "WRITER",
  "COOK", "WAITER", "PILOT", "CAPTAIN", "SOLDIER",
  "POLICE", "FARMER", "BUILDER", "MECHANIC", "MANAGER",
  "DENTIST", "SURGEON", "THERAPIST", "PHARMACIST", "CHEMIST",
  "PHYSICIST", "BIOLOGIST", "GEOLOGIST", "ASTRONOMER", "BOTANIST",
  "ARCHITECT", "PLUMBER", "ELECTRICIAN", "CARPENTER", "PAINTER",
  "BUTCHER", "BAKER", "FLORIST", "BARBER", "TAILOR",
  "BANKER", "ACCOUNTANT", "BROKER", "ANALYST", "CONSULTANT",
  "JOURNALIST", "EDITOR", "AUTHOR", "POET", "NOVELIST",
  "DIRECTOR", "PRODUCER", "COMPOSER", "MUSICIAN", "SCULPTOR",
  "DETECTIVE", "FIREFIGHTER", "PARAMEDIC", "LIFEGUARD", "RANGER",
  
  // Weather & Seasons
  "SUMMER", "WINTER", "SPRING", "AUTUMN", "SUNNY",
  "RAINY", "CLOUDY", "WINDY", "COLD", "HOT",
  "WARM", "COOL", "FREEZING", "HUMID", "DRY",
  "FOGGY", "MISTY", "HAZY", "FROSTY", "SNOWY",
  "BREEZY", "GUSTY", "DRIZZLE", "DOWNPOUR", "HAIL",
  "SLEET", "BLIZZARD", "TORNADO", "HURRICANE", "TYPHOON",
  "MONSOON", "DROUGHT", "RAINBOW", "SUNRISE", "SUNSET",
  
  // Emotions & Feelings
  "HAPPY", "SAD", "ANGRY", "SCARED", "EXCITED",
  "TIRED", "SLEEPY", "HUNGRY", "THIRSTY", "NERVOUS",
  "BRAVE", "CALM", "QUIET", "LOUD", "SILENT",
  "JOYFUL", "CHEERFUL", "PLEASED", "CONTENT", "GRATEFUL",
  "ANXIOUS", "WORRIED", "STRESSED", "PANIC", "FEARFUL",
  "PROUD", "HUMBLE", "CONFIDENT", "SHY", "BOLD",
  "CURIOUS", "AMAZED", "SURPRISED", "SHOCKED", "STUNNED",
  "BORED", "LONELY", "JEALOUS", "ENVIOUS", "GUILTY",
  
  // Numbers & Shapes
  "CIRCLE", "SQUARE", "TRIANGLE", "RECTANGLE", "DIAMOND",
  "OVAL", "SPHERE", "CUBE", "PYRAMID", "CYLINDER",
  "PENTAGON", "HEXAGON", "OCTAGON", "POLYGON", "PRISM",
  "CONE", "SPIRAL", "HELIX", "ARC", "CURVE",
  "ANGLE", "VERTEX", "EDGE", "SURFACE", "VOLUME",
  
  // Actions & Verbs
  "JUMP", "WALK", "RUN", "FLY", "SWIM",
  "DANCE", "SING", "LAUGH", "CRY", "SLEEP",
  "EAT", "DRINK", "READ", "WRITE", "DRAW",
  "PAINT", "BUILD", "BREAK", "CATCH", "THROW",
  "KICK", "PUSH", "PULL", "CLIMB", "FALL",
  "SPEAK", "LISTEN", "WATCH", "LOOK", "SEE",
  "TOUCH", "FEEL", "SMELL", "TASTE", "HEAR",
  "THINK", "DREAM", "IMAGINE", "CREATE", "DESIGN",
  "COOK", "BAKE", "FRY", "GRILL", "ROAST",
  "WASH", "CLEAN", "SWEEP", "SCRUB", "POLISH",
  "FOLD", "WRAP", "PACK", "CARRY", "LIFT",
  "OPEN", "CLOSE", "LOCK", "UNLOCK", "TURN",
  "START", "STOP", "PAUSE", "CONTINUE", "FINISH",
  "WIN", "LOSE", "PLAY", "SCORE", "COMPETE",
  
  // Adjectives
  "BIG", "SMALL", "TALL", "SHORT", "LONG",
  "FAST", "SLOW", "HARD", "SOFT", "ROUGH",
  "SMOOTH", "SHARP", "DULL", "BRIGHT", "DARK",
  "HEAVY", "LIGHT", "THICK", "THIN", "WIDE",
  "NARROW", "DEEP", "SHALLOW", "STEEP", "FLAT",
  "ROUND", "SQUARE", "CURVED", "STRAIGHT", "CROOKED",
  "CLEAN", "DIRTY", "FRESH", "STALE", "ROTTEN",
  "SWEET", "SOUR", "BITTER", "SALTY", "SPICY",
  "YOUNG", "OLD", "NEW", "ANCIENT", "MODERN",
  "RICH", "POOR", "CHEAP", "EXPENSIVE", "FREE",
  "STRONG", "WEAK", "TOUGH", "FRAGILE", "STURDY",
  "FULL", "EMPTY", "OPEN", "CLOSED", "BROKEN",
  
  // Musical Instruments
  "PIANO", "GUITAR", "VIOLIN", "DRUMS", "TRUMPET",
  "FLUTE", "HARP", "HORN", "ORGAN", "CELLO",
  "BASS", "BANJO", "UKULELE", "MANDOLIN", "SITAR",
  "OBOE", "CLARINET", "SAXOPHONE", "TROMBONE", "TUBA",
  "XYLOPHONE", "MARIMBA", "TAMBOURINE", "CYMBAL", "GONG",
  "ACCORDION", "HARMONICA", "BAGPIPE", "RECORDER", "PICCOLO",
  
  // Vehicles
  "BIKE", "CAR", "TRUCK", "TRAIN", "PLANE",
  "BOAT", "SHIP", "BUS", "TAXI", "JEEP",
  "MOTORCYCLE", "SCOOTER", "SKATEBOARD", "SEGWAY", "TRACTOR",
  "VAN", "SUV", "SEDAN", "COUPE", "WAGON",
  "YACHT", "CANOE", "KAYAK", "RAFT", "FERRY",
  "JET", "HELICOPTER", "GLIDER", "BLIMP", "ROCKET",
  "SUBWAY", "TRAM", "TROLLEY", "CABLE", "MONORAIL",
  "AMBULANCE", "FIRETRUCK", "POLICE", "TANK", "SUBMARINE",
  
  // Countries & Places
  "FRANCE", "CHINA", "JAPAN", "MEXICO", "EGYPT",
  "BRAZIL", "CANADA", "RUSSIA", "INDIA", "AFRICA",
  "EUROPE", "AMERICA", "PARIS", "LONDON", "TOKYO",
  "GERMANY", "ITALY", "SPAIN", "PORTUGAL", "GREECE",
  "TURKEY", "IRAN", "IRAQ", "ISRAEL", "JORDAN",
  "KOREA", "VIETNAM", "THAILAND", "MALAYSIA", "SINGAPORE",
  "INDONESIA", "AUSTRALIA", "ZEALAND", "FIJI", "HAWAII",
  "ARGENTINA", "CHILE", "PERU", "COLOMBIA", "VENEZUELA",
  "KENYA", "NIGERIA", "MOROCCO", "ALGERIA", "ETHIOPIA",
  "BERLIN", "ROME", "MADRID", "LISBON", "ATHENS",
  "DUBAI", "SYDNEY", "BEIJING", "MOSCOW", "MUMBAI",
  
  // Clothing & Fashion
  "SHIRT", "PANTS", "DRESS", "SKIRT", "JACKET",
  "COAT", "SWEATER", "HOODIE", "VEST", "BLAZER",
  "JEANS", "SHORTS", "LEGGINGS", "OVERALLS", "SUIT",
  "TIE", "BOWTIE", "SCARF", "GLOVES", "HAT",
  "CAP", "BEANIE", "HELMET", "CROWN", "TIARA",
  "BOOTS", "SNEAKERS", "SANDALS", "HEELS", "FLATS",
  "SOCKS", "BELT", "WATCH", "RING", "NECKLACE",
  "BRACELET", "EARRING", "PENDANT", "BROOCH", "ANKLET",
  
  // Buildings & Architecture
  "HOUSE", "APARTMENT", "CONDO", "MANSION", "COTTAGE",
  "CASTLE", "PALACE", "FORTRESS", "TOWER", "LIGHTHOUSE",
  "CHURCH", "TEMPLE", "MOSQUE", "CATHEDRAL", "CHAPEL",
  "SCHOOL", "COLLEGE", "UNIVERSITY", "LIBRARY", "MUSEUM",
  "HOSPITAL", "CLINIC", "PHARMACY", "LABORATORY", "OFFICE",
  "FACTORY", "WAREHOUSE", "GARAGE", "BARN", "SILO",
  "HOTEL", "MOTEL", "HOSTEL", "RESORT", "CASINO",
  "STADIUM", "ARENA", "THEATER", "CINEMA", "GALLERY",
  "BRIDGE", "TUNNEL", "DAM", "PIER", "DOCK",
  
  // Materials & Textures
  "WOOD", "METAL", "GLASS", "PLASTIC", "RUBBER",
  "LEATHER", "COTTON", "SILK", "WOOL", "LINEN",
  "VELVET", "SATIN", "DENIM", "CANVAS", "SUEDE",
  "STONE", "MARBLE", "GRANITE", "SLATE", "BRICK",
  "CONCRETE", "CEMENT", "PLASTER", "STEEL", "IRON",
  "COPPER", "BRONZE", "BRASS", "ALUMINUM", "TITANIUM",
  "CERAMIC", "PORCELAIN", "CLAY", "CRYSTAL", "DIAMOND",
  
  // Time & Calendar
  "SECOND", "MINUTE", "HOUR", "DAY", "WEEK",
  "MONTH", "YEAR", "DECADE", "CENTURY", "MILLENNIUM",
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY",
  "SATURDAY", "SUNDAY", "JANUARY", "FEBRUARY", "MARCH",
  "APRIL", "MAY", "JUNE", "JULY", "AUGUST",
  "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER", "HOLIDAY",
  "BIRTHDAY", "WEDDING", "ANNIVERSARY", "FESTIVAL", "CARNIVAL",
  
  // Music & Entertainment
  "MELODY", "RHYTHM", "HARMONY", "BEAT", "TEMPO",
  "CHORUS", "VERSE", "BRIDGE", "REFRAIN", "SOLO",
  "ALBUM", "TRACK", "SINGLE", "RECORD", "VINYL",
  "CONCERT", "FESTIVAL", "SHOW", "TOUR", "GIG",
  "MOVIE", "FILM", "DRAMA", "COMEDY", "HORROR",
  "ACTION", "ROMANCE", "THRILLER", "MYSTERY", "FANTASY",
  "CARTOON", "ANIME", "SERIES", "EPISODE", "SEASON",
  
  // Science & Elements
  "ATOM", "MOLECULE", "ELEMENT", "COMPOUND", "REACTION",
  "ENERGY", "FORCE", "GRAVITY", "MAGNET", "ELECTRIC",
  "PROTON", "NEUTRON", "ELECTRON", "NUCLEUS", "PHOTON",
  "CARBON", "OXYGEN", "NITROGEN", "HYDROGEN", "HELIUM",
  "SODIUM", "CALCIUM", "CHLORINE", "SULFUR", "PHOSPHORUS",
  "CELL", "DNA", "GENE", "VIRUS", "BACTERIA",
  "PROTEIN", "ENZYME", "HORMONE", "TISSUE", "ORGAN",
  
  // Fantasy & Mythology
  "DRAGON", "UNICORN", "PHOENIX", "GRIFFIN", "PEGASUS",
  "MERMAID", "CENTAUR", "MINOTAUR", "CYCLOPS", "HYDRA",
  "WIZARD", "WITCH", "FAIRY", "ELF", "DWARF",
  "GOBLIN", "TROLL", "OGRE", "GIANT", "GNOME",
  "KNIGHT", "PRINCE", "PRINCESS", "KING", "QUEEN",
  "MAGIC", "SPELL", "POTION", "WAND", "CRYSTAL",
  "QUEST", "TREASURE", "DUNGEON", "THRONE", "CROWN"
];

const GRID_RADIUS = 4; // Hex grid radius

function getHexNeighbors(q: number, r: number) {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  return directions.map(d => ({ q: q + d.q, r: r + d.r }));
}

function generateLevel() {
  // 1. Initialize Grid
  const grid: Map<string, HexCell> = new Map();
  for (let q = -GRID_RADIUS; q <= GRID_RADIUS; q++) {
    const r1 = Math.max(-GRID_RADIUS, -q - GRID_RADIUS);
    const r2 = Math.min(GRID_RADIUS, -q + GRID_RADIUS);
    for (let r = r1; r <= r2; r++) {
      grid.set(`${q},${r}`, { q, r, letter: '' });
    }
  }

  // 2. Place Words with overlap-aware algorithm
  const selectedWords: string[] = [];
  
  // Sort by length (longer first) and pick 10 random words
  const wordsToPlace = [...WORDS_POOL]
    .sort(() => 0.5 - Math.random())
    .slice(0, 15) // Pick more candidates
    .sort((a, b) => b.length - a.length); // Place longer words first

  // Helper to find cells with a specific letter already placed
  function findCellsWithLetter(letter: string): HexCell[] {
    return Array.from(grid.values()).filter(cell => cell.letter === letter);
  }

  // Helper to try placing a word starting from a specific position in the word
  function tryPlaceWord(word: string, startIdx: number, startCell: HexCell): HexCell[] | null {
    const path: HexCell[] = [];
    
    // Build path backwards from startIdx to 0
    let current = startCell;
    const backPath: HexCell[] = [current];
    
    for (let i = startIdx - 1; i >= 0; i--) {
      const neighbors = getHexNeighbors(current.q, current.r)
        .map(n => grid.get(`${n.q},${n.r}`))
        .filter(n => n !== undefined && !backPath.includes(n!))
        .filter(n => !n!.letter || n!.letter === word[i]) as HexCell[];
      
      // Prefer cells that already have the matching letter (overlap)
      const overlapping = neighbors.filter(n => n.letter === word[i]);
      const empty = neighbors.filter(n => !n.letter);
      const sorted = [...overlapping, ...empty];
      
      if (sorted.length === 0) return null;
      
      // Try a random valid neighbor
      current = sorted[Math.floor(Math.random() * sorted.length)];
      backPath.unshift(current);
    }
    
    // Build path forwards from startIdx to end
    current = startCell;
    const forwardPath: HexCell[] = [];
    
    for (let i = startIdx + 1; i < word.length; i++) {
      const neighbors = getHexNeighbors(current.q, current.r)
        .map(n => grid.get(`${n.q},${n.r}`))
        .filter(n => n !== undefined && !backPath.includes(n!) && !forwardPath.includes(n!))
        .filter(n => !n!.letter || n!.letter === word[i]) as HexCell[];
      
      // Prefer cells that already have the matching letter (overlap)
      const overlapping = neighbors.filter(n => n.letter === word[i]);
      const empty = neighbors.filter(n => !n.letter);
      const sorted = [...overlapping, ...empty];
      
      if (sorted.length === 0) return null;
      
      current = sorted[Math.floor(Math.random() * sorted.length)];
      forwardPath.push(current);
    }
    
    return [...backPath, ...forwardPath];
  }

  for (const word of wordsToPlace) {
    if (selectedWords.length >= 10) break; // Stop at 10 words
    
    let placed = false;
    let attempts = 0;
    
    // First, try to find overlap opportunities with existing letters
    for (let charIdx = 0; charIdx < word.length && !placed && attempts < 100; charIdx++) {
      const matchingCells = findCellsWithLetter(word[charIdx]);
      
      // Shuffle matching cells for randomness
      matchingCells.sort(() => 0.5 - Math.random());
      
      for (const startCell of matchingCells) {
        attempts++;
        if (attempts > 100) break;
        
        const path = tryPlaceWord(word, charIdx, startCell);
        if (path) {
          // Commit path
          path.forEach((cell, i) => {
            cell.letter = word[i];
            grid.set(`${cell.q},${cell.r}`, cell);
          });
          selectedWords.push(word);
          placed = true;
          break;
        }
      }
    }
    
    // If no overlap found, try random placement
    while (!placed && attempts < 150) {
      attempts++;
      const cells = Array.from(grid.values()).filter(c => !c.letter || c.letter === word[0]);
      if (cells.length === 0) break;
      
      const startCell = cells[Math.floor(Math.random() * cells.length)];
      const path = tryPlaceWord(word, 0, startCell);
      
      if (path) {
        path.forEach((cell, i) => {
          cell.letter = word[i];
          grid.set(`${cell.q},${cell.r}`, cell);
        });
        selectedWords.push(word);
        placed = true;
      }
    }
  }

  // 3. Fill remaining cells with random letters
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const cell of grid.values()) {
    if (!cell.letter) {
      cell.letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }

  return {
    grid: Array.from(grid.values()),
    words: selectedWords
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.game.start.path, (_req, res) => {
    const level = generateLevel();
    res.json(level);
  });

  app.get(api.scores.list.path, async (req, res) => {
    const period = (req.query.period as string) || 'all';
    const validPeriods = ['today', 'week', 'month', 'all'];
    const selectedPeriod = validPeriods.includes(period) ? period as 'today' | 'week' | 'month' | 'all' : 'all';
    const scores = await storage.getScoresByPeriod(selectedPeriod);
    res.json(scores);
  });

  app.post(api.scores.submit.path, async (req, res) => {
    try {
      const input = api.scores.submit.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
