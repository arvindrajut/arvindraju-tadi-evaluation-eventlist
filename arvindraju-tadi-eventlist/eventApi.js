const eventAPI = (() => {
    const API_URL = "http://localhost:3000/events";
  

    const getAll = async () => {
      const response = await fetch(API_URL);
      const events = await response.json();
      return events;
    };
  

    const add = async (newEvent) => {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });
      const event = await response.json();
      return event;
    };
 
    const edit = async (id, updatedEvent) => {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });
    };
  
 
    const deleteById = async (id) => {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
    };
  
    return {
      getAll,
      add,
      edit,
      deleteById,
    };
  })();
  