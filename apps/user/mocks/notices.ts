import type { Notice } from './types'

/**
 * 상시가 먼저, 그 아래는 최신순. 화면은 이 순서를 그대로 믿는다.
 * 연락처처럼 아직 정해지지 않은 값만 대괄호로 자리를 잡아 둔다.
 */
export const NOTICES: Notice[] = [
  {
    id: 'safety',
    kind: 'pinned',
    date: '2026-09-28',
    title: {
      ko: '축제 기간 안전 수칙',
      en: 'Safety rules for the festival',
      cha: '庆典期间安全须知',
    },
    body: [
      {
        ko: '사람이 몰리는 시간에는 무대 앞 통로를 비워 주세요. 안전 요원이 길을 열어 두는 자리입니다.',
        en: 'Keep the aisle in front of the stage clear when the crowd builds up. Safety staff need that lane open.',
        cha: '人流密集时请让开舞台前方的通道，那里是安全人员留出的通行道。',
      },
      {
        ko: '몸이 불편하면 가까운 의무실로 오세요. 대운동장과 중앙광장 두 곳에 있습니다.',
        en: 'Feeling unwell? Come to the nearest first aid post — one at the main field, one at the central plaza.',
        cha: '身体不适请前往就近的医务室。大运动场与中央广场各设一处。',
      },
      {
        ko: '급한 일은 학생회 상황실 [연락처] 로 알려 주세요. 축제가 끝날 때까지 계속 열려 있습니다.',
        en: 'For anything urgent, call the student council desk at [phone]. It stays open until the festival ends.',
        cha: '紧急情况请拨打学生会指挥室 [联系电话]，庆典结束前全程值守。',
      },
    ],
  },
  {
    id: 'lost-found-desk',
    kind: 'pinned',
    date: '2026-09-26',
    title: {
      ko: '분실물 보관소 운영 안내',
      en: 'Lost & found desk hours',
      cha: '失物招领处开放说明',
    },
    body: [
      {
        ko: '주운 물건과 잃어버린 물건은 모두 학생회관 1층 보관소로 모입니다. 축제 기간에는 12:00 부터 22:00 까지 엽니다.',
        en: 'Everything found or reported lost goes to the desk on the first floor of the student union building, open 12:00 to 22:00 during the festival.',
        cha: '拾到与遗失的物品统一交到学生会馆一层的招领处，庆典期间 12:00 至 22:00 开放。',
      },
      {
        ko: '찾아갈 때는 학생증을 보여 주세요. 축제가 끝난 뒤에도 일주일간 [학생과] 에서 보관합니다.',
        en: 'Bring your student ID to claim an item. Unclaimed items stay with [the student affairs office] for a week after the festival.',
        cha: '领取时请出示学生证。庆典结束后仍由 [学生处] 保管一周。',
      },
    ],
  },
  {
    id: 'lineup-second',
    kind: 'normal',
    date: '2026-10-01',
    title: {
      ko: '초청 공연 2차 라인업 공개',
      en: 'Second guest lineup announced',
      cha: '第二批特邀演出阵容公布',
    },
    body: [
      {
        ko: '이틀 차 무대에 설 초청 공연 두 팀을 새로 알립니다. 시간표는 타임라인에서 확인해 주세요.',
        en: 'Two more guest acts join the second day. Check the timeline for their slots.',
        cha: '第二天舞台新增两组特邀演出，具体时间请查看日程。',
      },
      {
        ko: '남은 한 팀은 [공개 예정일] 에 알립니다.',
        en: 'The last act will be revealed on [announcement date].',
        cha: '剩余一组将于 [公布日期] 公开。',
      },
    ],
  },
  {
    id: 'pub-hours',
    kind: 'normal',
    date: '2026-09-30',
    title: {
      ko: '주점 운영 시간이 바뀌었습니다',
      en: 'Pub hours have changed',
      cha: '酒馆营业时间调整',
    },
    body: [
      {
        ko: '주점은 두 날 모두 15:00 에 문을 열고 22:30 에 마지막 주문을 받습니다. 처음 공지한 시간보다 30분 늦게 닫습니다.',
        en: 'Pubs open at 15:00 on both days and take last orders at 22:30 — half an hour later than first announced.',
        cha: '两天的酒馆均于 15:00 开始营业，22:30 停止点单，比首次公告延后半小时。',
      },
      {
        ko: '주류 판매는 학생증 확인 후에 이뤄집니다. 신분증을 꼭 챙겨 주세요.',
        en: 'Alcohol is served only after an ID check, so keep your student card with you.',
        cha: '售酒须核验学生证，请随身携带证件。',
      },
    ],
  },
  {
    id: 'rain-plan',
    kind: 'normal',
    date: '2026-09-29',
    title: {
      ko: '비가 오면 공연은 이렇게 진행됩니다',
      en: 'What happens to the shows if it rains',
      cha: '遇雨时演出安排',
    },
    body: [
      {
        ko: '비가 내려도 공연은 그대로 진행합니다. 다만 천둥이 치거나 바람이 강하면 무대를 잠시 멈춥니다.',
        en: 'Shows go on in the rain. They pause only for thunder or strong wind.',
        cha: '小雨照常演出。仅在打雷或强风时暂停舞台。',
      },
      {
        ko: '중단이 정해지면 이 공지와 무대 화면으로 함께 알립니다.',
        en: 'If a pause is called, we announce it here and on the stage screen at the same time.',
        cha: '一旦决定暂停，将同时通过本公告与舞台屏幕通知。',
      },
    ],
  },
  {
    id: 'trash',
    kind: 'normal',
    date: '2026-09-27',
    title: {
      ko: '쓰레기 분리배출에 함께해 주세요',
      en: 'Please sort your waste',
      cha: '请配合垃圾分类',
    },
    body: [
      {
        ko: '분리배출 자리는 부스 구역마다 하나씩 두었습니다. 지도에서 위치를 확인할 수 있습니다.',
        en: 'There is one sorting station per booth zone. You can find them on the map.',
        cha: '每个摊位区域设有一处分类回收点，可在地图上查看位置。',
      },
      {
        ko: '음식물은 물기를 빼고 버려 주세요. 컵과 그릇은 씻어서 반납하면 다시 씁니다.',
        en: 'Drain food waste before tossing it, and rinse cups and bowls so they can be reused.',
        cha: '厨余请沥干后投放，杯碗洗净归还即可重复使用。',
      },
    ],
  },
  {
    id: 'traffic',
    kind: 'normal',
    date: '2026-09-25',
    title: {
      ko: '교통 통제와 주차 안내',
      en: 'Road closures and parking',
      cha: '交通管制与停车指引',
    },
    body: [
      {
        ko: '축제 이틀 동안 정문에서 대운동장까지는 차가 다니지 않습니다. 걸어서 이동해 주세요.',
        en: 'The road from the main gate to the field is closed to cars for both days. Please walk.',
        cha: '庆典两天内正门至大运动场路段禁止车辆通行，请步行前往。',
      },
      {
        ko: '차를 가져오면 [주차장 이름] 을 이용해 주세요. 자리가 많지 않아 대중교통을 권합니다.',
        en: 'If you drive, use [parking lot name]. Spaces are limited, so public transport is the safer bet.',
        cha: '如需驾车请使用 [停车场名称]。车位有限，建议乘坐公共交通。',
      },
    ],
  },
  {
    id: 'booth-guide',
    kind: 'normal',
    date: '2026-09-22',
    title: {
      ko: '부스 이용 안내',
      en: 'How the booths work',
      cha: '摊位使用说明',
    },
    body: [
      {
        ko: '부스는 12:00 에 문을 엽니다. 결제는 부스마다 다르니 계산대 앞 안내를 봐 주세요.',
        en: 'Booths open at 12:00. Payment methods differ from booth to booth — check the sign at the counter.',
        cha: '摊位 12:00 开始营业。各摊位支付方式不同，请查看收银台前的说明。',
      },
      {
        ko: '어느 학과와 동아리가 무엇을 여는지는 지도에서 볼 수 있습니다.',
        en: 'The map shows which department or club runs each booth.',
        cha: '各摊位由哪个院系或社团承办，可在地图上查看。',
      },
    ],
  },
]
