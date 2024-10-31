function wmoInterpretation(description, icon) {
    icon = `/icons/airy/${icon}@4x.png`;
    return {
        description,
        icon
    };
}

const WMO_CODES = {
    0: wmoInterpretation('맑음', 'clear'),
    1: wmoInterpretation('대부분 맑음', 'mostly-clear'),
    2: wmoInterpretation('부분적으로 흐림', 'partly-cloudy'),
    3: wmoInterpretation('흐림', 'overcast'),
    45: wmoInterpretation('안개', 'fog'),
    48: wmoInterpretation('얼음 안개', 'rime-fog'),
    51: wmoInterpretation('가벼운 이슬비', 'light-drizzle'),
    53: wmoInterpretation('이슬비', 'moderate-drizzle'),
    55: wmoInterpretation('강한 이슬비', 'dense-drizzle'),
    80: wmoInterpretation('가벼운 소나기', 'light-rain'),
    81: wmoInterpretation('소나기', 'moderate-rain'),
    82: wmoInterpretation('강한 소나기', 'heavy-rain'),
    61: wmoInterpretation('가벼운 비', 'light-rain'),
    63: wmoInterpretation('비', 'moderate-rain'),
    65: wmoInterpretation('강한 비', 'heavy-rain'),
    56: wmoInterpretation('가벼운 얼음 이슬비', 'light-freezing-drizzle'),
    57: wmoInterpretation('얼음 이슬비', 'dense-freezing-drizzle'),
    66: wmoInterpretation('가벼운 얼음비', 'light-freezing-rain'),
    67: wmoInterpretation('얼음비', 'heavy-freezing-rain'),
    71: wmoInterpretation('가벼운 눈', 'slight-snowfall'),
    73: wmoInterpretation('눈', 'moderate-snowfall'),
    75: wmoInterpretation('강한 눈', 'heavy-snowfall'),
    77: wmoInterpretation('눈 알갱이', 'snowflake'),
    85: wmoInterpretation('가벼운 눈 소나기', 'slight-snowfall'),
    86: wmoInterpretation('눈 소나기', 'heavy-snowfall'),
    95: wmoInterpretation('천둥 번개', 'thunderstorm'),
    96: wmoInterpretation('가벼운 천둥번개와 우박', 'thunderstorm-with-hail'),
    99: wmoInterpretation('천둥번개와 우박', 'thunderstorm-with-hail')
};


// 익스포트
export function wmoCode(code) {
    if (code !== undefined) {
        return WMO_CODES[code];
    }
    return {
        description: '...',
        icon: ''
    };
}