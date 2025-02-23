<template>
  <div class="archivio-container">
    <h2>Archivio Ordini</h2>

    <div class="filters">
      <label>Data:
        <input v-model="filtroData" type="date" />
      </label>
      <label>Cliente:
        <input v-model="filtroCliente" type="text" placeholder="Inserisci Cliente" />
      </label>
    </div>

    <div v-if="ordiniFiltrati.length">
      <table class="order-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Materiale</th>
            <th>Lavorazione</th>
            <th>Data</th>
            <th>Job ID</th>
            <th>Numero Ordine</th>
            <th>Stato</th>
            <th>Turno</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in ordiniFiltrati" :key="order.id">
            <td>{{ order.cliente }}</td>
            <td>{{ order.materiale }}</td>
            <td>{{ order.lavorazione }}</td>
            <td>{{ formattaData(order.data) }}</td>
            <td>{{ order.jobId }}</td>
            <td>{{ order.numeroOrdine }}</td>
            <td>{{ order.stato }}</td>
            <td>{{ order.turno }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>
      Nessun ordine archiviato.
    </p>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default {
  setup() {
    const ordini = ref([]);
    const filtroData = ref("");
    const filtroCliente = ref("");

    // Recupera ordini archiviati
    onMounted(() => {
      onSnapshot(collection(db, "orders"), (snapshot) => {
        ordini.value = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((order) => order.archiviato === true);
      });
    });

    const ordiniFiltrati = computed(() => {
      return ordini.value.filter((order) => {
        const matchData = !filtroData.value || order.data === filtroData.value;
        const matchCliente = !filtroCliente.value || order.cliente?.toLowerCase().includes(filtroCliente.value.toLowerCase());
        return matchData && matchCliente;
      });
    });

    // Stessa funzione per formattare la data
    const formattaData = (dataStr) => {
      if (!dataStr) return "";
      const parti = dataStr.split("-");
      return `${parti[2]}/${parti[1]}/${parti[0]}`;
    };

    return {
      ordini,
      filtroData,
      filtroCliente,
      ordiniFiltrati,
      formattaData,
    };
  },
};
</script>

<style scoped>
.archivio-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  text-align: center;
  background-color: #222;
  color: #fff;
}

.filters {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  color: black;
}

.order-table th,
.order-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.order-table th {
  background: #f4f4f4;
  font-weight: bold;
}
</style>
