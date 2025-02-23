<template>
  <div class="dashboard">
    <div class="container">
      <!-- Bottone per aprire il modale di inserimento -->
      <button class="open-modal-btn" @click="showModal = true">
        ➕ Aggiungi Nuovo Ordine
      </button>

      <!-- Componente modale per l'inserimento (assicurati di avere ModalAddOrder.vue) -->
      <ModalAddOrder
        v-if="showModal"
        @close="showModal = false"
        @order-added="handleOrderAdded"
      />

      <!-- Sezione per filtri e visualizzazione ordini -->
      <div class="order-section">
        <h2>Gestione Ordini</h2>
        <div class="filters">
          <!-- Campo Data con label e "simulazione" del type date -->
          <div class="filter-item">
            <label class="date-label" for="filtroData">Data (gg/mm/aaaa):</label>
            <input
              id="filtroData"
              v-model="filtroData"
              :type="dataType"
              placeholder="gg/mm/aaaa"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </div>
          <div class="filter-item">
            <label for="filtroJob">Job ID:</label>
            <input id="filtroJob" v-model="filtroJob" type="number" placeholder="Job ID" />
          </div>
          <div class="filter-item">
            <label for="filtroLavorazione">Lavorazione:</label>
            <select id="filtroLavorazione" v-model="filtroLavorazione">
              <option value="">Tutte le lavorazioni</option>
              <option value="Taglio">Taglio</option>
              <option value="Piegatura">Piegatura</option>
              <option value="Taglio + Piegatura">Taglio + Piegatura</option>
              <option value="Satinatura">Satinatura</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="filtroTurno">Turno:</label>
            <select id="filtroTurno" v-model="filtroTurno">
              <option value="">Tutti i turni</option>
              <option value="Mattina">Mattina</option>
              <option value="Pomeriggio">Pomeriggio</option>
              <option value="Notte">Notte</option>
            </select>
          </div>
          <div class="filter-item">
            <label for="filtroStato">Stato:</label>
            <select id="filtroStato" v-model="filtroStato">
              <option value="">Tutti gli stati</option>
              <option value="In attesa">In attesa</option>
              <option value="In lavorazione">In lavorazione</option>
              <option value="Lavorato">Lavorato</option>
            </select>
          </div>
        </div>

        <div class="order-list">
          <div v-for="order in ordiniFiltrati" :key="order.id" class="order-card">
            <p><strong>Cliente:</strong> {{ order.cliente }}</p>
            <p><strong>Materiale:</strong> {{ order.materiale }}</p>
            <p><strong>Lavorazione:</strong> {{ order.lavorazione }}</p>
            <p><strong>Data:</strong> {{ formattaData(order.data) }}</p>
            <p><strong>Job ID:</strong> {{ order.jobId }}</p>
            <p><strong>Numero Ordine:</strong> {{ order.numeroOrdine }}</p>
            <p>
              <strong>Stato:</strong>
              <span :class="getStatoClass(order.stato)" class="status-dot"></span>
              <select v-model="order.stato" @change="aggiornaOrdine(order)">
                <option value="In attesa">In attesa</option>
                <option value="In lavorazione">In lavorazione</option>
                <option value="Lavorato">Lavorato</option>
              </select>
              <button
                v-if="order.stato === 'Lavorato'"
                @click="archiviaOrdine(order)"
                class="archivia-btn"
              >
                Archivia
              </button>
            </p>
            <p><strong>Turno:</strong> {{ order.turno }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import ModalAddOrder from "@/components/ModalAddOrder.vue";
import { db } from "@/firebase";
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";

export default {
  components: { ModalAddOrder },
  setup() {
    // Variabili per gestione ordini e filtri
    const ordini = ref([]);
    // Campo data "simulato": di base è text, diventa date al focus
    const filtroData = ref("");
    const dataType = ref("text");

    const filtroJob = ref("");
    const filtroLavorazione = ref("");
    const filtroTurno = ref("");
    const filtroStato = ref("");

    // Recupero ordini da Firestore
    onSnapshot(collection(db, "orders"), (snapshot) => {
      ordini.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });

    // Funzioni per simulare l'input date
    const handleFocus = (event) => {
      dataType.value = "date";
    };

    const handleBlur = (event) => {
      if (!filtroData.value) {
        dataType.value = "text";
      }
    };

    // Computed per filtrare gli ordini (escludendo quelli archiviati)
    const ordiniFiltrati = computed(() => {
      return ordini.value.filter((order) => {
        return (
          order.archiviato !== true &&
          (!filtroData.value || order.data === filtroData.value) &&
          (!filtroJob.value || order.jobId?.toString().includes(filtroJob.value)) &&
          (!filtroLavorazione.value || order.lavorazione === filtroLavorazione.value) &&
          (!filtroTurno.value || order.turno === filtroTurno.value) &&
          (!filtroStato.value || order.stato === filtroStato.value)
        );
      });
    });

    // Funzione per aggiornare lo stato di un ordine in Firestore
    const aggiornaOrdine = async (order) => {
      const ordineRef = doc(db, "orders", order.id);
      await updateDoc(ordineRef, { stato: order.stato });
    };

    // Funzione per archiviare un ordine
    const archiviaOrdine = async (order) => {
      const ordineRef = doc(db, "orders", order.id);
      await updateDoc(ordineRef, { archiviato: true });
    };

    // Funzione per formattare la data da YYYY-MM-DD a DD/MM/YYYY
    const formattaData = (dataStr) => {
      if (!dataStr) return "";
      const parti = dataStr.split("-");
      return `${parti[2]}/${parti[1]}/${parti[0]}`;
    };

    // Restituisce la classe per il pallino dello stato
    const getStatoClass = (stato) => {
      switch (stato) {
        case "In attesa":
          return "status-red";
        case "In lavorazione":
          return "status-yellow";
        case "Lavorato":
          return "status-green";
        default:
          return "";
      }
    };

    // Variabile per la visibilità del modale
    const showModal = ref(false);

    // Gestione dell'evento order-added dal modale
    const handleOrderAdded = async (orderData) => {
      await addDoc(collection(db, "orders"), {
        ...orderData,
      });
    };

    return {
      // Variabili
      ordini,
      filtroData,
      dataType,
      filtroJob,
      filtroLavorazione,
      filtroTurno,
      filtroStato,

      // Computed
      ordiniFiltrati,

      // Metodi
      aggiornaOrdine,
      archiviaOrdine,
      formattaData,
      getStatoClass,
      showModal,
      handleOrderAdded,

      // Handler per input date simulato
      handleFocus,
      handleBlur,
    };
  },
};
</script>

<style>
/* Bottone per aprire il modale */
.open-modal-btn {
  display: block;
  margin: 0 auto 20px;
  padding: 10px 20px;
  font-size: 18px;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Contenitore principale */
.container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
}

/* Sezione lista ordini */
.order-section {
  width: 90%;
  max-width: 1000px;
  margin: 0 auto;
}

.order-section h2 {
  margin-bottom: 15px;
  text-align: center;
}

/* Sezione filtri con label */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-item {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 5px;
}

.filter-item label {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333; /* Etichetta scura per essere visibile su sfondo chiaro */
}

.filters input,
.filters select {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 180px;
  background-color: #f0f0f0;
  color: #333;
}

/* Simulazione date su iOS:
   type="text" con placeholder, diventa date al focus se l'utente tocca */
.filters input[type="date"] {
  appearance: none; /* Toglie l'icona nativa su iOS */
}

/* Lista degli ordini */
.order-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.order-card {
  background: #444;
  padding: 15px;
  border-radius: 10px;
  width: 280px;
  color: #fff;
}

.order-card p {
  margin: 5px 0;
  font-size: 16px;
}

/* Pallini per lo stato */
.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-red { background: red; }
.status-yellow { background: orange; }
.status-green { background: green; }

/* Bottone per archiviare */
.archivia-btn {
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
  background-color: #dc3545;
  border: none;
  border-radius: 5px;
  color: #fff;
  cursor: pointer;
}

.archivia-btn:hover {
  background-color: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: center;
  }
  .filters input,
  .filters select {
    width: 100%;
    max-width: 300px;
  }
  .order-card {
    width: 100%;
  }
}
</style>
