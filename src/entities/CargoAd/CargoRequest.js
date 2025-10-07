export default class CargoRequest {
    constructor({
        requestId,                 // генерит сервис (push().key)
        sender = {},               // { id, name, photourl, contact } — водитель
        dateSent,                  // "dd.mm.yyyy"
        status = 'pending',        // 'pending' | 'accepted' | 'declined' | 'cancelled'
        dateConfirmed = null,      // "dd.mm.yyyy" | null
        description = '',          // текст предложения/условий
    }) {
        this.requestId = requestId;
        this.sender = sender;
        this.dateSent = dateSent;
        this.status = status;
        this.dateConfirmed = dateConfirmed;
        this.description = description;
    }

    updateStatus(newStatus, dateConfirmed = null) {
        this.status = newStatus;
        if (dateConfirmed) this.dateConfirmed = dateConfirmed;
    }
}
