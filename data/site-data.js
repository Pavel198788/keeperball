/*
  Данные сайта «Кубок Открытой Лиги Кипербола».
  Правится вручную — инструкция в README.md (раздел «Как править данные»).
  Сезон 2026 — по странице турнира на nml.su (см. source); сезон 2027 — по презентации.
*/
window.SITE_DATA = {
  contacts: { email: "[ПОЧТА — впиши]", phone: "[ТЕЛЕФОН — впиши]", social: "[ТЕЛЕГРАМ/ВК — впиши]" },
  currentSeason: "2026",
  seasons: {
    "2026": {
      title: "Сезон 2026",
      note: "Следующие игры сезона 2026 — даты и место будут объявлены",
      source: "https://nml.su/tournament/1068086",
      teams: [
        { id: "yunost-moskvy", name: "Юность Москвы", city: "Москва", logo: "assets/teams/yunost-moskvy.svg",
          players: [
            { name: "Афонин Александр", number: null, goalkeeper: false },
            { name: "Балахонов Владислав", number: null, goalkeeper: false },
            { name: "Болдырев Иван", number: null, goalkeeper: false },
            { name: "Волков Даниил", number: null, goalkeeper: false },
            { name: "Исхаков Фаил", number: null, goalkeeper: false },
            { name: "Константинов Александр", number: null, goalkeeper: false },
            { name: "Малахов Геннадий", number: null, goalkeeper: false },
            { name: "Сазонов Артём", number: null, goalkeeper: false },
            { name: "Стеценко Алексей", number: null, goalkeeper: false },
            { name: "Талеб Адам", number: null, goalkeeper: false },
            { name: "Тарвердиев Михаил", number: null, goalkeeper: false },
            { name: "Тишкин Дамиан", number: null, goalkeeper: false }
          ] },
        { id: "torpedo-m", name: "Торпедо М", city: "Москва", logo: "assets/teams/torpedo-m.svg",
          players: [
            { name: "Смеян Александр", number: null, goalkeeper: false },
            { name: "Сурков Илья", number: null, goalkeeper: false },
            { name: "Шевляков Ильяс", number: null, goalkeeper: false },
            { name: "Антонов Василий", number: 8, goalkeeper: false },
            { name: "Бондаренко Тимофей", number: 8, goalkeeper: false },
            { name: "Вучкович Марко", number: 9, goalkeeper: false },
            { name: "Микоян Ника", number: 17, goalkeeper: false },
            { name: "Газыев Рафаэль", number: 21, goalkeeper: false },
            { name: "Сенько Дмитрий", number: 26, goalkeeper: true },
            { name: "Ковальчук Матвей", number: 27, goalkeeper: false },
            { name: "Писляков Илья", number: 35, goalkeeper: true },
            { name: "Карман Григорий", number: 63, goalkeeper: false },
            { name: "Орешин Максим", number: 71, goalkeeper: false },
            { name: "Бурлаков Егор", number: 83, goalkeeper: false },
            { name: "Шмелев Даниил", number: 87, goalkeeper: false },
            { name: "Коннов Егор", number: 92, goalkeeper: false },
            { name: "Зимеров Прохор", number: 96, goalkeeper: false }
          ] },
        { id: "prialit", name: "Приалит", city: "Реутов", logo: "assets/teams/prialit.svg",
          players: [
            { name: "Александров Антон", number: null, goalkeeper: false },
            { name: "Ашуров Абубакр", number: null, goalkeeper: false },
            { name: "Габриелян Мгер", number: null, goalkeeper: false },
            { name: "Герасин Иван", number: null, goalkeeper: false },
            { name: "Исайков Евгений", number: null, goalkeeper: false },
            { name: "Князев Иван", number: null, goalkeeper: false },
            { name: "Мещеряков Максим", number: null, goalkeeper: false },
            { name: "Ниезов Дейкхон", number: null, goalkeeper: false },
            { name: "Родин Николай", number: null, goalkeeper: false },
            { name: "Рыбаков Арсений", number: null, goalkeeper: false },
            { name: "Симич Стефан", number: null, goalkeeper: false },
            { name: "Третьяков Дени", number: null, goalkeeper: false }
          ] }
      ],
      matches: [
        { id: "2026-1", stage: "Финал", round: 1, date: "2026-10-15", time: "10:30",
          venue: "Стадион «Приалит», Реутов, ул. Новая, 1А",
          home: "torpedo-m", away: "prialit",
          scoreAsPublished: { home: 7, away: 7 },
          keeperbattle: null, main: null, penalties: null, winner: null,
          playoff: false },
        { id: "2026-2", stage: "Финал", round: 2, date: "2026-10-15", time: "12:00",
          venue: "Стадион «Приалит», Реутов, ул. Новая, 1А",
          home: "prialit", away: "yunost-moskvy",
          scoreAsPublished: { home: 6, away: 9 },
          keeperbattle: null, main: null, penalties: null, winner: null,
          playoff: false },
        { id: "2026-3", stage: "Финал", round: 3, date: "2026-10-15", time: "13:30",
          venue: "Стадион «Приалит», Реутов, ул. Новая, 1А",
          home: "yunost-moskvy", away: "torpedo-m",
          scoreAsPublished: { home: 8, away: 9 },
          keeperbattle: null, main: null, penalties: null, winner: null,
          playoff: false }
      ],
      pointsOverride: { "yunost-moskvy": 4, "torpedo-m": 3, "prialit": 2 },
      overrideNote: "Очки — по итогам организатора; разбивка по матчам уточняется"
    },
    "2027": {
      title: "Сезон 2027",
      note: "Расписание матчей появится перед стартом сезона в марте 2027",
      teams: [
        { id: "cska", name: "ЦСКА", city: null, logo: null, players: [] },
        { id: "spartak", name: "Спартак", city: null, logo: null, players: [] },
        { id: "lokomotiv", name: "Локомотив", city: null, logo: null, players: [] },
        { id: "dinamo", name: "Динамо", city: null, logo: null, players: [] },
        { id: "rodina", name: "Родина", city: null, logo: null, players: [] },
        { id: "chertanovo", name: "Чертаново", city: null, logo: null, players: [] },
        { id: "master-saturn", name: "Мастер-Сатурн", city: null, logo: null, players: [] },
        { id: "vityaz", name: "Витязь", city: null, logo: null, players: [] }
      ],
      matches: [],
      pointsOverride: null
    }
  }
};
