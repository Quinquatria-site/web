import type { Localized } from './layout'

/**
 * 장소 이름·주최·설명. layout.ts 의 자리표시 문구를 여기서 덮는다.
 *
 * layout.ts 를 고치지 않는 이유는 그 파일이 user 앱에서 문자 그대로 복사해 온
 * 좌표 원본이기 때문이다 (그쪽이 갱신되면 통째로 다시 복사한다). 좌표는 원본에서
 * 오고 이름은 여기서 온다.
 *
 * 실 라인업이 확정되면 이 파일만 갈아끼운다. 대괄호 자리표시를 걷어낸 이유는
 * 분실물 목이 적어둔 것과 같다 — `[부스 A-1]` 로는 목록 행의 길이도, 배지와
 * 부딪히는지도, 지도 마커에 이름이 들어가는지도 판단할 수 없다.
 */

/** 주최 단과대. 부스마다 다시 적지 않으려고 한 번만 둔다 */
const COLLEGES = {
  interp: {
    ko: '통번역대학',
    en: 'College of Interpretation and Translation',
    cha: '口笔译学院',
  },
  china: { ko: '중국학대학', en: 'College of Chinese Studies', cha: '中国学学院' },
  japan: { ko: '일본학대학', en: 'College of Japanese Studies', cha: '日本学学院' },
  europe: { ko: '동유럽학대학', en: 'College of East European Studies', cha: '东欧学学院' },
  asia: {
    ko: '아시아언어문화대학',
    en: 'College of Asian Languages and Cultures',
    cha: '亚洲语言文化学院',
  },
  intl: { ko: '국제지역대학', en: 'College of International Studies', cha: '国际地区学院' },
  biz: { ko: '경상대학', en: 'College of Business and Economics', cha: '经商学院' },
  sci: { ko: '자연과학대학', en: 'College of Natural Sciences', cha: '自然科学学院' },
  eng: { ko: '공과대학', en: 'College of Engineering', cha: '工学院' },
  ai: { ko: 'AI융합대학', en: 'College of AI Convergence', cha: 'AI融合学院' },
  sports: {
    ko: '국제스포츠레저학부',
    en: 'Division of International Sports and Leisure',
    cha: '国际体育休闲学部',
  },
  council: { ko: '총학생회', en: 'Student Council', cha: '学生会' },
} as const satisfies Record<string, Localized>

type College = keyof typeof COLLEGES

export interface PlaceInfo {
  name: Localized
  host: Localized
  description: Localized
}

const info = (name: Localized, college: College, description: Localized): PlaceInfo => ({
  name,
  host: COLLEGES[college],
  description,
})

/**
 * 주점·푸드트럭·의무실·팔찌 수령소. layout.ts 의 id 를 키로 쓴다.
 *
 * pub-1 과 pub-2, food-1 은 menus.ts 가 이미 메뉴를 걸어둔 곳이라 이름을 거기
 * 주석과 맞춘다 (통번역대학 주점 · 동유럽학대학 주점 · 꼬치 트럭).
 */
export const PLACE_INFO: Record<string, PlaceInfo> = {
  'pub-1': info(
    { ko: '통번역대학 주점', en: 'Interpretation & Translation Pub', cha: '口笔译学院酒馆' },
    'interp',
    {
      ko: '전 좌석 예약 없이 운영합니다. 안주 주문은 입구 키오스크에서 받습니다.',
      en: 'Walk-in seating only. Order at the kiosk by the entrance.',
      cha: '无需预约，直接入座。请在入口自助机点单。',
    },
  ),
  'pub-2': info(
    { ko: '동유럽학대학 주점', en: 'East European Studies Pub', cha: '东欧学学院酒馆' },
    'europe',
    {
      ko: '체코와 폴란드 가정식을 안주로 냅니다. 학생증 확인 후 주류를 제공합니다.',
      en: 'Czech and Polish home cooking. Student ID required for alcohol.',
      cha: '提供捷克与波兰家常菜。饮酒需出示学生证。',
    },
  ),
  'pub-3': info(
    { ko: '경상대학 주점', en: 'Business & Economics Pub', cha: '经商学院酒馆' },
    'biz',
    {
      ko: '단체석이 가장 넓습니다. 10인 이상은 입구에서 안내를 받아 주세요.',
      en: 'Largest group seating. Parties of 10 or more, check in at the entrance.',
      cha: '团体座位最多。十人以上请在入口处登记。',
    },
  ),
  'pub-4': info(
    { ko: '중국학대학 주점', en: 'Chinese Studies Pub', cha: '中国学学院酒馆' },
    'china',
    {
      ko: '마라 계열 안주를 냅니다. 맵기는 주문할 때 단계로 고를 수 있습니다.',
      en: 'Mala-style dishes. Choose your spice level when ordering.',
      cha: '提供麻辣类菜品。点单时可选择辣度。',
    },
  ),
  'pub-5': info({ ko: '공과대학 주점', en: 'Engineering Pub', cha: '工学院酒馆' }, 'eng', {
    ko: '무대와 가장 가까운 주점입니다. 공연 시간에는 대기가 길어집니다.',
    en: 'Closest pub to the stage. Expect a wait during performances.',
    cha: '距离舞台最近的酒馆。演出时段等候时间较长。',
  }),

  'food-1': info({ ko: '꼬치 트럭', en: 'Skewer Truck', cha: '串烧餐车' }, 'council', {
    ko: '숯불 닭꼬치를 굽습니다. 현금과 카드 모두 받습니다.',
    en: 'Charcoal-grilled chicken skewers. Cash and card accepted.',
    cha: '炭烤鸡肉串。现金与刷卡均可。',
  }),
  'food-2': info({ ko: '분식 트럭', en: 'Snack Truck', cha: '小吃餐车' }, 'council', {
    ko: '떡볶이와 튀김을 함께 담아 줍니다. 포장만 가능합니다.',
    en: 'Tteokbokki and fritters in one tray. Takeout only.',
    cha: '辣炒年糕与炸物拼盘。仅提供外带。',
  }),
  'food-3': info({ ko: '커피 트럭', en: 'Coffee Truck', cha: '咖啡餐车' }, 'council', {
    ko: '아이스 아메리카노와 라떼를 냅니다. 텀블러를 가져오면 500원 깎아 줍니다.',
    en: 'Iced americano and latte. Bring a tumbler for 500 won off.',
    cha: '提供冰美式与拿铁。自带随行杯可减 500 韩元。',
  }),
  'food-4': info({ ko: '디저트 트럭', en: 'Dessert Truck', cha: '甜点餐车' }, 'council', {
    ko: '츄러스와 아이스크림을 냅니다. 오후 늦게 재료가 먼저 떨어집니다.',
    en: 'Churros and ice cream. Tends to sell out in the late afternoon.',
    cha: '提供吉事果与冰淇淋。傍晚常会售罄。',
  }),
  'food-5': info({ ko: '타코 트럭', en: 'Taco Truck', cha: '墨西哥卷餐车' }, 'council', {
    ko: '고수는 빼 달라고 말하면 빼 줍니다. 채식 메뉴가 하나 있습니다.',
    en: 'Cilantro on request. One vegetarian option available.',
    cha: '可要求不加香菜。设有一款素食选项。',
  }),

  'aid-1': info(
    { ko: '의무실 (운동장 본부석)', en: 'First Aid (Field HQ)', cha: '医务室（运动场指挥台）' },
    'council',
    {
      ko: '대운동장 본부석 옆입니다. 축제 시간 내내 간호 인력이 상주합니다.',
      en: 'Beside the main field HQ. Staffed by a nurse throughout the festival.',
      cha: '位于大运动场指挥台旁。节庆期间有护理人员常驻。',
    },
  ),
  'aid-2': info(
    { ko: '의무실 (학생회관)', en: 'First Aid (Student Union)', cha: '医务室（学生会馆）' },
    'council',
    {
      ko: '학생회관 1층 로비 안쪽입니다. 휠체어로 들어올 수 있습니다.',
      en: 'Inside the Student Union lobby, 1F. Wheelchair accessible.',
      cha: '位于学生会馆一楼大厅内侧。可轮椅通行。',
    },
  ),
  'aid-3': info(
    { ko: '의무실 (부스 구역)', en: 'First Aid (Booth Area)', cha: '医务室（摊位区）' },
    'council',
    {
      ko: 'C구역 초입에 있습니다. 응급 상황은 안전요원에게 먼저 알려 주세요.',
      en: 'At the entrance to Zone C. In an emergency, tell a safety marshal first.',
      cha: '位于 C 区入口。紧急情况请先告知安全人员。',
    },
  ),

  'bracelet-1': info(
    {
      ko: '팔찌 수령소 (오바마홀)',
      en: 'Bracelet Pickup (Obama Hall)',
      cha: '手环领取处（奥巴马厅）',
    },
    'council',
    {
      ko: '학생증을 보여 주면 팔찌를 드립니다. 하루에 한 번만 받을 수 있습니다.',
      en: 'Show your student ID to receive a bracelet. One per person per day.',
      cha: '出示学生证即可领取手环。每人每天限领一次。',
    },
  ),
}

/**
 * 부스 58곳. 구역마다 성격이 다르다 — A 체험·게임, B 먹거리, C 굿즈·전시,
 * D 학과 홍보. 실제 배치도 이렇게 묶여 있어서 목록을 구역으로 걸러 보는 것이
 * 의미가 있다.
 */
export const BOOTH_INFO: Record<string, PlaceInfo> = {
  // A구역 — 체험·게임
  'A-1': info({ ko: '별빛 타로', en: 'Starlight Tarot', cha: '星光塔罗' }, 'interp', {
    ko: '질문 하나에 카드 세 장을 뽑습니다. 통번역대학 학생이 통역을 도와줍니다.',
    en: 'Three cards for one question. Students interpret on request.',
    cha: '一个问题抽三张牌。学院学生可协助翻译。',
  }),
  'A-2': info({ ko: '사격 부스', en: 'Shooting Gallery', cha: '射击摊位' }, 'sports', {
    ko: '과녁 다섯 발을 쏩니다. 전부 맞히면 경품을 드립니다.',
    en: 'Five shots at the target. Hit them all for a prize.',
    cha: '射击五发。全中可获奖品。',
  }),
  'A-3': info({ ko: '다트 한 판', en: 'Dart Round', cha: '飞镖一局' }, 'sports', {
    ko: '세 발을 던져 점수를 겨룹니다. 상위 점수는 칠판에 적어 둡니다.',
    en: 'Three darts, best score wins. Top scores go on the board.',
    cha: '投掷三镖比分数。高分记录在黑板上。',
  }),
  'A-4': info({ ko: '인형뽑기', en: 'Claw Machine', cha: '娃娃机' }, 'biz', {
    ko: '기계 두 대를 돌립니다. 실패하면 한 번 더 기회를 줍니다.',
    en: 'Two machines running. One retry if you come up empty.',
    cha: '两台机器运行中。未夹中可再试一次。',
  }),
  'A-5': info({ ko: '네컷 사진관', en: 'Four-Cut Photo', cha: '四格照相馆' }, 'ai', {
    ko: '축제 전용 프레임으로 찍습니다. 인화까지 1분쯤 걸립니다.',
    en: 'Shot with a festival-only frame. About a minute to print.',
    cha: '使用节庆专用边框拍摄。冲印约需一分钟。',
  }),
  'A-6': info({ ko: '페이스 페인팅', en: 'Face Painting', cha: '脸部彩绘' }, 'asia', {
    ko: '도안 열 가지 중에 고릅니다. 물수건으로 지워집니다.',
    en: 'Ten designs to choose from. Comes off with a wet wipe.',
    cha: '十种图案可选。用湿巾即可擦除。',
  }),
  'A-7': info({ ko: '헤나 타투', en: 'Henna Tattoo', cha: '海娜纹身' }, 'intl', {
    ko: '마르는 데 10분쯤 걸립니다. 일주일이면 지워집니다.',
    en: 'About ten minutes to dry. Fades within a week.',
    cha: '晾干约需十分钟。一周左右自然褪去。',
  }),
  'A-8': info({ ko: '캐리커처', en: 'Caricature', cha: '漫画肖像' }, 'japan', {
    ko: '한 장에 10분쯤 걸립니다. 대기가 길면 번호표를 받아 가세요.',
    en: 'About ten minutes per drawing. Take a number if the line is long.',
    cha: '每张约十分钟。排队较长时请取号。',
  }),
  'A-9': info({ ko: '딱지치기', en: 'Ttakji Flip', cha: '拍纸牌' }, 'council', {
    ko: '세 판을 겨룹니다. 딱지는 직접 접어서 씁니다.',
    en: 'Best of three. Fold your own ttakji to play.',
    cha: '三局定胜负。纸牌需自行折叠。',
  }),
  'A-10': info({ ko: '제기차기', en: 'Jegi Kick', cha: '踢毽子' }, 'sports', {
    ko: '30초 동안 몇 번 차는지 셉니다. 기록은 매시간 갱신합니다.',
    en: 'Count your kicks in 30 seconds. Records reset hourly.',
    cha: '计算 30 秒内的踢毽次数。每小时更新纪录。',
  }),
  'A-11': info({ ko: '방탈출 미니', en: 'Mini Escape Room', cha: '迷你密室逃脱' }, 'eng', {
    ko: '10분짜리 짧은 방입니다. 2~4명이 함께 들어갑니다.',
    en: 'A short ten-minute room. Two to four people per run.',
    cha: '十分钟的短篇密室。每场 2 至 4 人。',
  }),
  'A-12': info({ ko: '룰렛 경품', en: 'Prize Roulette', cha: '轮盘抽奖' }, 'biz', {
    ko: '한 번 돌립니다. 꽝이 없고 가장 작은 칸도 사탕입니다.',
    en: 'One spin each. No blanks — the smallest slot is candy.',
    cha: '每人转一次。没有空奖，最小奖项也是糖果。',
  }),
  'A-13': info({ ko: '손금 보기', en: 'Palm Reading', cha: '看手相' }, 'china', {
    ko: '한 사람에 5분씩 봅니다. 중국어로도 봐 드립니다.',
    en: 'Five minutes per person. Available in Chinese as well.',
    cha: '每人约五分钟。可用中文解读。',
  }),
  'A-14': info({ ko: '보드게임 카페', en: 'Board Game Cafe', cha: '桌游咖啡' }, 'ai', {
    ko: '게임 열두 종을 빌려 줍니다. 자리는 30분씩 돌아가며 씁니다.',
    en: 'Twelve games to borrow. Tables rotate every 30 minutes.',
    cha: '提供十二种桌游借用。座位每 30 分钟轮换。',
  }),

  // B구역 — 먹거리
  'B-1': info({ ko: '솜사탕 공장', en: 'Cotton Candy Factory', cha: '棉花糖工坊' }, 'sci', {
    ko: '색을 세 가지 중에 고릅니다. 바람이 불면 잘 부서집니다.',
    en: 'Three colors to choose from. Fragile on windy days.',
    cha: '三种颜色可选。有风时容易碎。',
  }),
  'B-2': info({ ko: '슬러시 바', en: 'Slush Bar', cha: '沙冰吧' }, 'sci', {
    ko: '레몬과 청포도 두 가지입니다. 컵은 다회용으로 받습니다.',
    en: 'Lemon and green grape. Served in reusable cups.',
    cha: '柠檬与青提两种。使用可重复杯具。',
  }),
  'B-3': info({ ko: '츄러스 가게', en: 'Churro Stand', cha: '吉事果摊' }, 'europe', {
    ko: '설탕과 시나몬 중에 고릅니다. 초코 소스는 따로 받습니다.',
    en: 'Sugar or cinnamon. Chocolate sauce costs extra.',
    cha: '砂糖或肉桂可选。巧克力酱另计。',
  }),
  'B-4': info({ ko: '버블티 스탠드', en: 'Bubble Tea Stand', cha: '珍珠奶茶摊' }, 'china', {
    ko: '당도와 얼음을 고를 수 있습니다. 펄은 삶는 대로 나갑니다.',
    en: 'Choose sweetness and ice. Pearls served as each batch finishes.',
    cha: '可选甜度与冰量。珍珠现煮现出。',
  }),
  'B-5': info({ ko: '와플 굽는 집', en: 'Waffle House', cha: '华夫饼屋' }, 'europe', {
    ko: '생크림과 잼을 올려 드립니다. 한 판 굽는 데 3분 걸립니다.',
    en: 'Topped with cream and jam. Three minutes per waffle.',
    cha: '配鲜奶油与果酱。每份约需三分钟。',
  }),
  'B-6': info({ ko: '호떡 굽는 집', en: 'Hotteok Stand', cha: '糖饼摊' }, 'council', {
    ko: '씨앗호떡입니다. 안이 뜨거우니 조금 식혀 드세요.',
    en: 'Seed-filled hotteok. Let it cool — the filling is hot.',
    cha: '坚果馅糖饼。内馅很烫，请稍待再食用。',
  }),
  'B-7': info({ ko: '타코야키 부스', en: 'Takoyaki Booth', cha: '章鱼烧摊位' }, 'japan', {
    ko: '여섯 알씩 담습니다. 가다랑어포는 빼 달라고 할 수 있습니다.',
    en: 'Six pieces per order. Bonito flakes optional.',
    cha: '每份六颗。可要求不加木鱼花。',
  }),
  'B-8': info({ ko: '소떡소떡', en: 'Sausage & Rice Cake', cha: '香肠年糕串' }, 'council', {
    ko: '소스는 간장과 매운맛 두 가지입니다. 한 꼬치에 네 알입니다.',
    en: 'Soy or spicy sauce. Four pieces per skewer.',
    cha: '酱油味与辣味两种。每串四颗。',
  }),
  'B-9': info({ ko: '핫도그 가게', en: 'Corn Dog Stand', cha: '热狗摊' }, 'biz', {
    ko: '감자를 붙인 것과 안 붙인 것이 있습니다. 설탕은 직접 뿌립니다.',
    en: 'With or without potato coating. Sugar is self-serve.',
    cha: '有裹土豆与原味两种。砂糖自助添加。',
  }),
  'B-10': info({ ko: '감자튀김 트럭', en: 'Fries Stand', cha: '薯条摊' }, 'sports', {
    ko: '시즈닝 다섯 가지를 직접 섞습니다. 봉투째 흔들어 드세요.',
    en: 'Five seasonings to mix yourself. Shake the bag to coat.',
    cha: '五种调味粉可自行搭配。请摇动纸袋拌匀。',
  }),
  'B-11': info({ ko: '레모네이드 가판', en: 'Lemonade Cart', cha: '柠檬水摊' }, 'intl', {
    ko: '얼음을 많이 넣어 드립니다. 텀블러를 가져오면 리필해 줍니다.',
    en: 'Served over plenty of ice. Free refill with your own tumbler.',
    cha: '加入大量冰块。自带杯可免费续杯。',
  }),
  'B-12': info({ ko: '아이스크림 카트', en: 'Ice Cream Cart', cha: '冰淇淋车' }, 'sci', {
    ko: '소프트콘을 뽑아 드립니다. 낮에는 금방 녹습니다.',
    en: 'Soft-serve cones. Melts fast in the afternoon sun.',
    cha: '现制甜筒。午后融化较快。',
  }),
  'B-13': info({ ko: '팝콘 기계', en: 'Popcorn Machine', cha: '爆米花机' }, 'ai', {
    ko: '카라멜과 소금 두 가지입니다. 큰 통은 나눠 먹기 좋습니다.',
    en: 'Caramel or salted. The large tub is made for sharing.',
    cha: '焦糖与咸味两种。大桶适合分享。',
  }),
  'B-14': info({ ko: '붕어빵 노점', en: 'Bungeoppang Stall', cha: '鲫鱼饼摊' }, 'council', {
    ko: '팥과 슈크림을 굽습니다. 세 마리부터 봉투에 담아 드립니다.',
    en: 'Red bean or custard. Bagged from three pieces up.',
    cha: '红豆与卡仕达两种。三条以上装袋。',
  }),
  'B-15': info({ ko: '쿠키 굽는 부스', en: 'Cookie Booth', cha: '饼干摊位' }, 'japan', {
    ko: '그날 구운 것만 팝니다. 알레르기 정보는 앞에 붙여 두었습니다.',
    en: 'Same-day baking only. Allergy info posted at the counter.',
    cha: '仅售当日烘焙。过敏信息张贴于摊前。',
  }),
  'B-16': info({ ko: '마카롱 가게', en: 'Macaron Shop', cha: '马卡龙店' }, 'europe', {
    ko: '여섯 가지 맛을 한 상자에 담습니다. 더운 날에는 빨리 드세요.',
    en: 'Six flavors in a box. Eat soon on warm days.',
    cha: '一盒六种口味。天热时请尽快食用。',
  }),
  'B-17': info({ ko: '핸드드립 커피', en: 'Hand-Drip Coffee', cha: '手冲咖啡' }, 'intl', {
    ko: '원두 세 종을 그때그때 갈아 내립니다. 한 잔에 5분쯤 걸립니다.',
    en: 'Three beans, ground to order. About five minutes a cup.',
    cha: '三种豆现磨现冲。每杯约需五分钟。',
  }),

  // C구역 — 굿즈·전시
  'C-1': info({ ko: '키링 공방', en: 'Keyring Workshop', cha: '钥匙扣工坊' }, 'asia', {
    ko: '이름을 새겨 드립니다. 새기는 데 5분쯤 걸립니다.',
    en: 'Name engraving available. About five minutes to engrave.',
    cha: '可刻名字。刻字约需五分钟。',
  }),
  'C-2': info({ ko: '스티커 가게', en: 'Sticker Shop', cha: '贴纸店' }, 'ai', {
    ko: '축제 한정 도안입니다. 노트북에 붙여도 잘 안 떨어집니다.',
    en: 'Festival-only designs. Holds up on a laptop lid.',
    cha: '节庆限定图案。贴在笔电上不易脱落。',
  }),
  'C-3': info({ ko: '엽서 가판', en: 'Postcard Stand', cha: '明信片摊' }, 'europe', {
    ko: '캠퍼스 풍경 열두 장입니다. 우표를 붙이면 그 자리에서 부쳐 드립니다.',
    en: 'Twelve campus scenes. Add a stamp and we mail it for you.',
    cha: '十二张校园风景。贴上邮票可当场寄出。',
  }),
  'C-4': info({ ko: '폴라로이드 부스', en: 'Polaroid Booth', cha: '拍立得摊位' }, 'japan', {
    ko: '한 장씩 찍어 바로 드립니다. 필름이 떨어지면 조기 마감합니다.',
    en: 'One shot, handed over on the spot. Closes early if film runs out.',
    cha: '一次一张，当场交付。胶片用完将提前收摊。',
  }),
  'C-5': info({ ko: '캘리그래피', en: 'Calligraphy', cha: '手写书法' }, 'china', {
    ko: '원하는 문구를 써 드립니다. 한자와 한글 모두 됩니다.',
    en: 'Any phrase you like, in Hangul or Chinese characters.',
    cha: '可书写指定语句，中文与韩文皆可。',
  }),
  'C-6': info({ ko: '향수 만들기', en: 'Perfume Making', cha: '调香体验' }, 'sci', {
    ko: '향 다섯 가지를 섞어 10ml 를 만듭니다. 만드는 데 15분쯤 걸립니다.',
    en: 'Blend five notes into a 10ml bottle. About fifteen minutes.',
    cha: '调配五种香调制成 10ml。约需十五分钟。',
  }),
  'C-7': info({ ko: '천연 비누 공방', en: 'Soap Workshop', cha: '手工皂工坊' }, 'sci', {
    ko: '굳는 데 20분 걸립니다. 만들고 나중에 찾아가도 됩니다.',
    en: 'Twenty minutes to set. You can pick it up later.',
    cha: '凝固需二十分钟。可稍后再来领取。',
  }),
  'C-8': info({ ko: '팔찌 만들기', en: 'Bracelet Making', cha: '手链制作' }, 'asia', {
    ko: '실과 구슬을 골라 엮습니다. 처음이면 도와드립니다.',
    en: 'Pick your thread and beads. We help first-timers.',
    cha: '自选线材与珠子编织。新手可获协助。',
  }),
  'C-9': info({ ko: '도자기 체험', en: 'Pottery Trial', cha: '陶艺体验' }, 'asia', {
    ko: '컵 하나를 빚습니다. 구워서 2주 뒤에 학과 사무실에서 찾아갑니다.',
    en: 'Shape one cup. Fired and ready at the department office in two weeks.',
    cha: '制作一只杯子。烧制后两周到系办领取。',
  }),
  'C-10': info({ ko: '학과 사진전', en: 'Photo Exhibition', cha: '摄影展' }, 'intl', {
    ko: '해외 교환학생 사진 40점을 겁니다. 관람은 무료입니다.',
    en: 'Forty photos from exchange students. Free to view.',
    cha: '展出交换生摄影作品四十幅。免费参观。',
  }),
  'C-11': info({ ko: '서예 체험', en: 'Brush Writing', cha: '书法体验' }, 'china', {
    ko: '붓으로 이름을 써 봅니다. 먹이 묻으니 소매를 걷어 주세요.',
    en: 'Write your name with a brush. Roll up your sleeves — ink stains.',
    cha: '用毛笔书写姓名。墨易沾染，请挽起袖子。',
  }),
  'C-12': info({ ko: '헌책 장터', en: 'Used Book Market', cha: '旧书市集' }, 'interp', {
    ko: '전공 서적을 싸게 넘깁니다. 판매 수익은 장학금으로 씁니다.',
    en: 'Cheap textbooks. Proceeds go to the scholarship fund.',
    cha: '低价转让专业书籍。收益用作奖学金。',
  }),
  'C-13': info({ ko: '에코백 프린팅', en: 'Tote Bag Printing', cha: '帆布袋印制' }, 'eng', {
    ko: '도안을 골라 찍어 드립니다. 잉크가 마를 때까지 들고 다니세요.',
    en: 'Pick a design and we press it. Carry it open until the ink dries.',
    cha: '选好图案现场压印。墨干前请摊开拿着。',
  }),
  'C-14': info({ ko: '뱃지 제작소', en: 'Badge Maker', cha: '徽章制作' }, 'ai', {
    ko: '그림을 그리면 뱃지로 만들어 줍니다. 한 사람에 두 개까지입니다.',
    en: 'Draw it and we press it into a badge. Two per person.',
    cha: '绘图后现场压制徽章。每人限两枚。',
  }),

  // D구역 — 학과 홍보·상담
  'D-1': info({ ko: '통번역 체험', en: 'Interpreting Trial', cha: '口译体验' }, 'interp', {
    ko: '부스에서 동시통역을 3분 해 봅니다. 장비는 실제 수업에서 쓰는 것입니다.',
    en: 'Three minutes in a real interpreting booth. Same gear as class.',
    cha: '在同传厢体验三分钟。设备与课堂所用相同。',
  }),
  'D-2': info({ ko: '어학 퀴즈', en: 'Language Quiz', cha: '语言问答' }, 'asia', {
    ko: '일곱 개 언어에서 문제를 냅니다. 다 맞히면 학과 굿즈를 드립니다.',
    en: 'Questions from seven languages. Perfect score wins department merch.',
    cha: '涵盖七种语言的题目。全对可获学院周边。',
  }),
  'D-3': info({ ko: '전공 소개 부스', en: 'Major Info Booth', cha: '专业介绍摊位' }, 'intl', {
    ko: '재학생이 커리큘럼을 직접 설명합니다. 신입생 질문을 가장 많이 받습니다.',
    en: 'Current students walk you through the curriculum. Freshmen ask the most.',
    cha: '在校生讲解课程设置。新生提问最多。',
  }),
  'D-4': info({ ko: '진로 상담소', en: 'Career Counseling', cha: '职业咨询处' }, 'biz', {
    ko: '졸업생이 15분씩 상담합니다. 이력서를 가져오면 같이 봐 줍니다.',
    en: 'Fifteen minutes with an alum. Bring a resume and we review it together.',
    cha: '毕业生提供十五分钟咨询。可带简历一同修改。',
  }),
  'D-5': info({ ko: '세계 간식 시식', en: 'World Snack Tasting', cha: '世界零食试吃' }, 'intl', {
    ko: '여덟 나라 간식을 조금씩 냅니다. 알레르기 표시를 확인해 주세요.',
    en: 'Small bites from eight countries. Check the allergy labels.',
    cha: '提供八国零食小份试吃。请查看过敏标示。',
  }),
  'D-6': info({ ko: '전통 의상 체험', en: 'Traditional Dress', cha: '传统服饰体验' }, 'china', {
    ko: '한복과 치파오를 입어 봅니다. 사진은 직접 찍어 가세요.',
    en: 'Try on hanbok and qipao. Photos are self-serve.',
    cha: '可试穿韩服与旗袍。请自行拍照。',
  }),
  'D-7': info({ ko: '다도 체험', en: 'Tea Ceremony', cha: '茶道体验' }, 'japan', {
    ko: '말차를 직접 저어 마십니다. 한 번에 네 명씩 앉습니다.',
    en: 'Whisk and drink your own matcha. Four seats per sitting.',
    cha: '亲手点抹茶品饮。每轮四人就座。',
  }),
  'D-8': info({ ko: '전통놀이 마당', en: 'Folk Games', cha: '传统游戏场' }, 'council', {
    ko: '윷놀이와 투호를 놓았습니다. 팀을 짜면 바로 시작합니다.',
    en: 'Yut and pitch-pot set up. Form a team and start right away.',
    cha: '设有掷柶与投壶。组队即可开始。',
  }),
  'D-9': info({ ko: 'VR 체험존', en: 'VR Zone', cha: 'VR 体验区' }, 'eng', {
    ko: '한 사람에 5분씩 돌아갑니다. 어지러우면 바로 말씀해 주세요.',
    en: 'Five minutes per person. Say so right away if you feel dizzy.',
    cha: '每人五分钟轮换。如感不适请立即告知。',
  }),
  'D-10': info({ ko: '코딩 미니 강연', en: 'Coding Mini-Talk', cha: '编程小讲座' }, 'ai', {
    ko: '매시 정각에 20분씩 합니다. 노트북 없이 들어도 됩니다.',
    en: 'Twenty minutes, on the hour. No laptop needed.',
    cha: '每逢整点讲二十分钟。无需自带笔电。',
  }),
  'D-11': info({ ko: '동아리 연합 홍보', en: 'Club Fair', cha: '社团联合宣传' }, 'council', {
    ko: '동아리 스물세 곳이 돌아가며 섭니다. 가입 신청은 이 자리에서 받습니다.',
    en: 'Twenty-three clubs take turns at the table. Sign up on the spot.',
    cha: '二十三个社团轮流驻场。可现场报名。',
  }),
  'D-12': info({ ko: '헌혈 캠페인', en: 'Blood Drive', cha: '献血活动' }, 'council', {
    ko: '헌혈 버스가 D구역 끝에 섭니다. 신분증이 있어야 합니다.',
    en: 'The blood bus parks at the end of Zone D. Photo ID required.',
    cha: '献血车停在 D 区尽头。需携带身份证件。',
  }),
  'D-13': info({ ko: '분리배출 캠페인', en: 'Recycling Campaign', cha: '垃圾分类活动' }, 'sci', {
    ko: '컵 다섯 개를 가져오면 에코백으로 바꿔 드립니다.',
    en: 'Bring five cups and trade them for a tote bag.',
    cha: '带回五个杯子可换购物袋。',
  }),
}
