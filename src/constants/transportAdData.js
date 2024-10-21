// truckTypes.js
export const truckTypes = [
    {
        name: 'Еврофура',
        description:
            'Также известная как тент или полуприцеп. Универсальный класс для перевозки различных грузов, не требующий особенного температурного режима. Погрузку можно осуществлять с любой из четырех сторон. Как правило, выдерживает до 25 т, по вместительности — около 30-35 европаллетов.',
    },
    {
        name: 'Изотерм',
        description:
            'Изолированный грузовой отсек, не оснащенный холодильным оборудованием. Подходит для перевозки скоропортящихся грузов, но только при условии быстрой доставки, поскольку поддерживает заданную температуру небольшое количество времени.',
    },
    {
        name: 'Рефрижератор',
        description:
            'Внутри расположена холодильная установка, позволяющая перевозить даже продукты, находящиеся в глубокой заморозке шоковым методом.',
    },
    {
        name: 'Jumbo',
        description:
            'Полуприцеп тентованного типа, имеющий ступенчатый пол, обеспечивающий хорошую вместительность. Колесные диски такого кузова имеют малый радиус.',
    },
    {
        name: 'Автосцепка',
        description:
            'Комбинированный вид грузовика, который хорошо подходит для быстрой погрузки/разгрузки. Включает в себя тягач, прицеп, тент. Не требует получения специальных лицензий для перемещения по общим дорогам.',
    },
    {
        name: 'Цельнометаллические',
        description:
            'Как понятно из названия, имеют металлические стенки. Таким образом кузов очень прочный, защищен от возможных краж при помощи дверей из металла с замками. Их минус заключается в весьма ограниченных методах загрузки и разгрузки.',
    },
    {
        name: 'Открытая платформа',
        description:
            'Без бортов с высокой грузоподъемностью, для товаров, которым безразлична погода.',
    },
    {
        name: 'Контейнеровоз',
        description:
            'Без бортов, специально для транспортировки контейнеров. Может иметь различные модификации исходя из конкретного типа перевозимых контейнеров.',
    },
    {
        name: 'Автоцистерна',
        description:
            'Для наливных грузов, с одним либо несколькими отделениями. Может быть круглой, в форме эллипса или же чемодана. Круглые наиболее прочные, эллиптические - компактные. А «чемоданы» устойчивы к опрокидыванию, благодаря смещенному центру тяжести.',
    },
    {
        name: 'Автовоз',
        description: 'Для перемещения легковых авто.',
    },
];

// loadingTypes.js
export const loadingTypes = [
    {
        name: 'Верхняя',
        description: 'Стандартный метод, подходящий для большинства грузов.',
    },
    {
        name: 'Боковая',
        description: 'Удобна для загрузки и выгрузки с обеих сторон.',
    },
    {
        name: 'Задняя',
        description: 'Часто используется для длинномерных грузов.',
    },
    {
        name: 'Гидроборт',
        description: 'Облегчает процесс погрузки и разгрузки тяжёлых грузов.',
    },
    {
        name: 'Аппарели',
        description:
            'Удобны для загрузки легковых автомобилей и других низкопрофильных грузов.',
    },
    {
        name: 'Налив',
        description:
            'Используется для жидких грузов (например, в автоцистернах).',
    },
    {
        name: 'Электрический',
        description:
            'Поднимает грузы с помощью электрической системы (может быть вариантом для гидроборто́в или аппарелей).',
    },
    {
        name: 'Гидравлический',
        description:
            'Ещё один вид механизма для погрузки, который может быть полезен.',
    },
    {
        name: 'Без ворот',
        description: 'Обеспечивает легкий доступ к грузу.',
    },
];

// truckTypesWithLoading.js
export const truckTypesWithLoading = [
    {
        name: 'Еврофура',
        description:
            'Также известная как тент или полуприцеп. Универсальный класс для перевозки различных грузов, не требующий особенного температурного режима.',
        loadingTypes: [
            'Верхняя',
            'Боковая',
            'Задняя',
            'Гидроборт',
            'Без ворот',
        ],
    },
    {
        name: 'Изотерм',
        description:
            'Изолированный грузовой отсек, не оснащенный холодильным оборудованием. Подходит для перевозки скоропортящихся грузов.',
        loadingTypes: ['Верхняя', 'Боковая', 'Задняя', 'Без ворот'],
    },
    {
        name: 'Рефрижератор',
        description:
            'Внутри расположена холодильная установка, позволяющая перевозить даже продукты, находящиеся в глубокой заморозке.',
        loadingTypes: ['Верхняя', 'Боковая', 'Задняя', 'Без ворот'],
    },
    {
        name: 'Jumbo',
        description:
            'Полуприцеп тентованного типа, имеющий ступенчатый пол, обеспечивающий хорошую вместительность.',
        loadingTypes: [
            'Верхняя',
            'Боковая',
            'Задняя',
            'Гидроборт',
            'Без ворот',
        ],
    },
    {
        name: 'Автосцепка',
        description:
            'Комбинированный вид грузовика, который хорошо подходит для быстрой погрузки/разгрузки.',
        loadingTypes: [
            'Верхняя',
            'Боковая',
            'Задняя',
            'Гидроборт',
            'Электрический',
        ],
    },
    {
        name: 'Цельнометаллические',
        description:
            'Как понятно из названия, имеют металлические стенки, защищены от возможных краж.',
        loadingTypes: ['Верхняя', 'Боковая', 'Задняя', 'Без ворот'],
    },
    {
        name: 'Открытая платформа',
        description:
            'Без бортов с высокой грузоподъемностью, для товаров, которым безразлична погода.',
        loadingTypes: ['Верхняя', 'Боковая', 'Задняя'],
    },
    {
        name: 'Контейнеровоз',
        description: 'Без бортов, специально для транспортировки контейнеров.',
        loadingTypes: ['Верхняя', 'Боковая', 'Задняя', 'Аппарели'],
    },
    {
        name: 'Автоцистерна',
        description:
            'Для наливных грузов, с одним либо несколькими отделениями.',
        loadingTypes: ['Налив', 'Верхняя'],
    },
    {
        name: 'Автовоз',
        description: 'Для перемещения легковых авто.',
        loadingTypes: ['Аппарели', 'Гидроборт', 'Верхняя'],
    },
];