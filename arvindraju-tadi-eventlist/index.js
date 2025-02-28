// Event Model
class EventModel {
    #events = [];
  
    constructor() {
      this.#events = [];
    }
  
    setEvents(events) {
      this.#events = events;
    }
  
    getEvents() {
      return this.#events;
    }
  
    addEvent(newEvent) {
      this.#events.push(newEvent);
    }
  
    removeEvent(id) {
      this.#events = this.#events.filter((event) => event.id !== id);
    }
  }
  
  // Event View
  class EventView {
    constructor() {
      this.eventList = document.querySelector("#event-list");
      this.addEventBtn = document.querySelector("#add-event-btn");
    }
  
    renderEvents(events) {
      this.eventList.innerHTML = "";
      events.forEach((event) => this.addEvent(event));
    }
  
    addEvent(event, isNew = false) {
      const row = document.createElement("tr");
      row.id = `event-${event.id || "new"}`;
  
      if (isNew) {
        row.innerHTML = `
          <td><input type="text" placeholder="Event Name"></td>
          <td><input type="date"></td>
          <td><input type="date"></td>
          <td>
            <button class="save">+</button>
            <button class="discard">X</button>
          </td>
        `;
      } else {
        row.innerHTML = `
          <td>${event.name}</td>
          <td>${event.start}</td>
          <td>${event.end}</td>
          <td>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </td>
        `;
      }
  
      this.eventList.appendChild(row);
    }
  
    removeEvent(id) {
      const row = document.getElementById(`event-${id}`);
      if (row) row.remove();
    }
  }
  
  // Event Controller
  class EventController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
  
      this.init();
    }
  
    async init() {
      
      const events = await eventAPI.getAll();
      this.model.setEvents(events);
      this.view.renderEvents(events);
  
     
      this.setupAddEvent();
      this.setupEventActions();
    }
  
    setupAddEvent() {
      this.view.addEventBtn.addEventListener("click", () => this.view.addEvent({}, true));
    }
  
    setupEventActions() {
      this.view.eventList.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
  
        if (e.target.classList.contains("save")) {
          row.id === "event-new" ? await this.saveNewEvent(row) : await this.updateEvent(row);
        } else if (e.target.classList.contains("discard")) {
          row.id === "event-new" ? this.view.removeEvent("new") : this.discardEdit(row);
        } else if (e.target.classList.contains("edit")) {
          this.editEvent(row);
        } else if (e.target.classList.contains("delete")) {
          await this.deleteEvent(row);
        }
      });
    }
  
    async saveNewEvent(row) {
      const inputs = row.querySelectorAll("input");
      const newEvent = {
        name: inputs[0].value.trim(),
        start: inputs[1].value,
        end: inputs[2].value,
      };
  
      if (!newEvent.name || !newEvent.start || !newEvent.end) {
        alert("All fields are required.");
        return;
      }
  
      const savedEvent = await eventAPI.add(newEvent);
      this.model.addEvent(savedEvent);
      this.updateRowToDisplayMode(row, savedEvent);
    }
  
    editEvent(row) {
      const cells = row.querySelectorAll("td");
      const eventData = {
        name: cells[0].textContent,
        start: cells[1].textContent,
        end: cells[2].textContent,
      };
  
      row.dataset.original = JSON.stringify(eventData);
  
      cells[0].innerHTML = `<input type="text" value="${eventData.name}" />`;
      cells[1].innerHTML = `<input type="date" value="${eventData.start}" />`;
      cells[2].innerHTML = `<input type="date" value="${eventData.end}" />`;
  
      const buttons = row.querySelectorAll("button");
      buttons[0].textContent = "Save";
      buttons[0].classList.replace("edit", "save");
  
      buttons[1].textContent = "X";
      buttons[1].classList.replace("delete", "discard");
    }
  
    async updateEvent(row) {
      const id = row.id.split("-")[1];
      const inputs = row.querySelectorAll("input");
      const updatedEvent = {
        id,
        name: inputs[0].value.trim(),
        start: inputs[1].value,
        end: inputs[2].value,
      };
  
      if (!updatedEvent.name || !updatedEvent.start || !updatedEvent.end) {
        alert("All fields are required.");
        return;
      }
  
      await eventAPI.edit(id, updatedEvent);
      this.model.setEvents(
        this.model.getEvents().map((event) => (event.id === id ? updatedEvent : event))
      );
  
      this.updateRowToDisplayMode(row, updatedEvent);
    }
  
    discardEdit(row) {
      const originalData = JSON.parse(row.dataset.original);
      this.updateRowToDisplayMode(row, originalData);
    }
  
    async deleteEvent(row) {
      const id = row.id.split("-")[1];
      await eventAPI.deleteById(id);
      this.model.removeEvent(id);
      this.view.removeEvent(id);
    }
  
    updateRowToDisplayMode(row, event) {
      row.innerHTML = `
        <td>${event.name}</td>
        <td>${event.start}</td>
        <td>${event.end}</td>
        <td>
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </td>
      `;
    }
  }
  

  const eventModel = new EventModel();
  const eventView = new EventView();
  const eventController = new EventController(eventModel, eventView);