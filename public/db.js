let db;
// create db request for new
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = (event) => {
  // creates object store called "pending" and set autoIncrement to true
  const db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = (event) => {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    // checkDatabase();
  }
};

request.onerror = (event) => {
  console.log('Woops! ' + event.target.errorCode);
};

const saveRecord = (record) => {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');

  // access your pending store
  const store = transaction.objectStore('pending');

  // add  a record to your store
  store.add(record);
};

const checkDatabase = () => {
  // open a transaction on your pending db
  const transaction = db.transaction(['pending'], 'readwrite');
  // access your pending object store
  const store = transaction.objectStore('pending');
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(['pending'], 'readwrite');

          // access your pending object store
          const store = transaction.objectStore('pending');

          // clear all items in your store
          store.clear();
        });
    }
  };
};

// listen for app coming back online
window.addEventListener('online', checkDatabase);
