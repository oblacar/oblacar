export const adStatus = ['active', 'work', 'completed', 'deleted'];

// статусы запросов:
// pending – Запрос отправлен, но еще не обработан владельцем объявления.
// accepted – Запрос принят владельцем объявления.
// declined – Запрос отклонен владельцем объявления.
// cancelled – Запрос отменен отправителем до обработки владельцем.
// inProgress – Запрос принят, транспортировка в процессе выполнения.
// completed – Запрос завершен, транспортировка выполнена.
// failed – Запрос завершен с ошибкой или несоответствием условий.

export const transportationRequestStatus = [
    'pending',
    'accepted',
    'declined',
    'cancelled',
    'inProgress',
    'completed',
    'failed',
];