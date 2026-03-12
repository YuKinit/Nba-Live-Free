import { colors } from '../theme.js';

const LOGO_BASE = 'https://a.espncdn.com/i/teamlogos/nba/500';

const TEAMS_LIST = [
  { key: 'Hawks', name: 'Atlanta Hawks', code: 'ATL', primary: '#E03A3E', secondary: '#C1D32F', logoKey: 'atl' },
  { key: 'Celtics', name: 'Boston Celtics', code: 'BOS', primary: '#007A33', secondary: '#BA9653', logoKey: 'bos' },
  { key: 'Nets', name: 'Brooklyn Nets', code: 'BKN', primary: '#000000', secondary: '#FFFFFF', logoKey: 'bkn' },
  { key: 'Hornets', name: 'Charlotte Hornets', code: 'CHA', primary: '#1D1160', secondary: '#00788C', logoKey: 'cha' },
  { key: 'Bulls', name: 'Chicago Bulls', code: 'CHI', primary: '#CE1141', secondary: '#000000', logoKey: 'chi' },
  { key: 'Cavaliers', name: 'Cleveland Cavaliers', code: 'CLE', primary: '#860038', secondary: '#FDBB30', logoKey: 'cle' },
  { key: 'Mavericks', name: 'Dallas Mavericks', code: 'DAL', primary: '#00538C', secondary: '#002B5E', logoKey: 'dal' },
  { key: 'Nuggets', name: 'Denver Nuggets', code: 'DEN', primary: '#0E2240', secondary: '#FEC524', logoKey: 'den' },
  { key: 'Pistons', name: 'Detroit Pistons', code: 'DET', primary: '#C8102E', secondary: '#1D42BA', logoKey: 'det' },
  { key: 'Warriors', name: 'Golden State Warriors', code: 'GSW', primary: '#1D428A', secondary: '#FFC72C', logoKey: 'gsw' },
  { key: 'Rockets', name: 'Houston Rockets', code: 'HOU', primary: '#CE1141', secondary: '#000000', logoKey: 'hou' },
  { key: 'Pacers', name: 'Indiana Pacers', code: 'IND', primary: '#002D62', secondary: '#FDBB30', logoKey: 'ind' },
  { key: 'Clippers', name: 'LA Clippers', code: 'LAC', primary: '#C8102E', secondary: '#1D42BA', logoKey: 'lac' },
  { key: 'Lakers', name: 'Los Angeles Lakers', code: 'LAL', primary: '#552583', secondary: '#FDB927', logoKey: 'lal' },
  { key: 'Grizzlies', name: 'Memphis Grizzlies', code: 'MEM', primary: '#5D76A9', secondary: '#12173F', logoKey: 'mem' },
  { key: 'Heat', name: 'Miami Heat', code: 'MIA', primary: '#98002E', secondary: '#F9A01B', logoKey: 'mia' },
  { key: 'Bucks', name: 'Milwaukee Bucks', code: 'MIL', primary: '#00471B', secondary: '#FDB927', logoKey: 'mil' },
  { key: 'Timberwolves', name: 'Minnesota Timberwolves', code: 'MIN', primary: '#0C2340', secondary: '#236192', logoKey: 'min' },
  { key: 'Pelicans', name: 'New Orleans Pelicans', code: 'NOP', primary: '#0C2340', secondary: '#C8102E', logoKey: 'no' },
  { key: 'Knicks', name: 'New York Knicks', code: 'NYK', primary: '#006BB6', secondary: '#F58426', logoKey: 'ny' },
  { key: 'Thunder', name: 'Oklahoma City Thunder', code: 'OKC', primary: '#007AC1', secondary: '#EF3B24', logoKey: 'okc' },
  { key: 'Magic', name: 'Orlando Magic', code: 'ORL', primary: '#0077C0', secondary: '#C4CED4', logoKey: 'orl' },
  { key: '76ers', name: 'Philadelphia 76ers', code: 'PHI', primary: '#006BB6', secondary: '#ED174C', logoKey: 'phi' },
  { key: 'Suns', name: 'Phoenix Suns', code: 'PHX', primary: '#1D1160', secondary: '#E56020', logoKey: 'phx' },
  { key: 'Trail Blazers', name: 'Portland Trail Blazers', code: 'POR', primary: '#E03A3E', secondary: '#000000', logoKey: 'por' },
  { key: 'Kings', name: 'Sacramento Kings', code: 'SAC', primary: '#5A2D81', secondary: '#63727A', logoKey: 'sac' },
  { key: 'Spurs', name: 'San Antonio Spurs', code: 'SAS', primary: '#C4CED4', secondary: '#000000', logoKey: 'sa' },
  { key: 'Raptors', name: 'Toronto Raptors', code: 'TOR', primary: '#CE1141', secondary: '#000000', logoKey: 'tor' },
  { key: 'Jazz', name: 'Utah Jazz', code: 'UTA', primary: '#002B5C', secondary: '#00471B', logoKey: 'utah' },
  { key: 'Wizards', name: 'Washington Wizards', code: 'WAS', primary: '#002B5C', secondary: '#E31837', logoKey: 'wsh' },
];

const TEAMS = {};
TEAMS_LIST.forEach((t) => {
  TEAMS[t.key] = {
    name: t.name,
    code: t.code,
    primary: t.primary,
    secondary: t.secondary,
    logo: `${LOGO_BASE}/${t.logoKey}.png`,
  };
});
TEAMS['Sixers'] = TEAMS['76ers'];
TEAMS['Blazers'] = TEAMS['Trail Blazers'];

const NAME_TO_KEY = {};
const CODE_TO_KEY = {};
TEAMS_LIST.forEach((t) => {
  NAME_TO_KEY[t.name.toLowerCase()] = t.key;
  NAME_TO_KEY[t.key.toLowerCase()] = t.key;
  CODE_TO_KEY[t.code.toLowerCase()] = t.key;
});

function findTeamKey(teamKey) {
  if (!teamKey || typeof teamKey !== 'string') return null;
  const trimmed = teamKey.trim();
  if (TEAMS[trimmed]) return trimmed;
  const lower = trimmed.toLowerCase();
  if (NAME_TO_KEY[lower]) return NAME_TO_KEY[lower];
  if (CODE_TO_KEY[lower]) return CODE_TO_KEY[lower];
  for (const t of TEAMS_LIST) {
    if (t.name.toLowerCase().includes(lower) || t.key.toLowerCase().includes(lower))
      return t.key;
  }
  return null;
}

export function getTeamInfo(teamKey) {
  const key = findTeamKey(teamKey);
  const base = key ? TEAMS[key] : null;
  if (base) return base;
  const code =
    typeof teamKey === 'string' && teamKey.length >= 3
      ? teamKey.slice(0, 3).toUpperCase()
      : 'NBA';
  return {
    name: teamKey,
    code,
    primary: colors.surfaceElevated,
    secondary: colors.gold,
    logo: '',
  };
}
