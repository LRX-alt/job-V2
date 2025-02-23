<template>
  <form @submit.prevent="addOrder">
    <input v-model="cliente" placeholder="Cliente" required />
    <input v-model="materiale" placeholder="Materiale" required />

    <select v-model="lavorazione">
      <option value="Taglio">Taglio</option>
      <option value="Piegatura">Piegatura</option>
      <option value="Taglio + Piegatura">Taglio + Piegatura</option>
      <option value="Satinatura">Satinatura</option>
    </select>

    <input v-model="data" type="date" required />

    <input v-model="jobId" type="number" placeholder="Numero Job" required />

    <select v-model="stato">
      <option value="In attesa">In attesa</option>
      <option value="In lavorazione">In lavorazione</option>
      <option value="Lavorato">Lavorato</option>
    </select>

    <select v-model="turno">
      <option value="Mattina">Mattina</option>
      <option value="Pomeriggio">Pomeriggio</option>
      <option value="Notte">Notte</option>
    </select>

    <button type="submit">Aggiungi Ordine</button>
  </form>
</template>

<script>
import { ref } from "vue";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export default {
  setup() {
    const cliente = ref("");
    const materiale = ref("");
    const lavorazione = ref("Taglio");
    const data = ref(""); // Nuova data
    const jobId = ref(""); // Numero job
    const stato = ref("In attesa");
    const turno = ref("Mattina");

    const addOrder = async () => {
      await addDoc(collection(db, "orders"), {
        cliente: cliente.value,
        materiale: materiale.value,
        lavorazione: lavorazione.value,
        data: data.value, // Salva la data
        jobId: jobId.value, // Salva il numero job
        stato: stato.value,
        turno: turno.value,
      });

      // Reset campi dopo inserimento
      cliente.value = "";
      materiale.value = "";
      lavorazione.value = "Taglio";
      data.value = "";
      jobId.value = "";
      stato.value = "In attesa";
      turno.value = "Mattina";
    };

    return { cliente, materiale, lavorazione, data, jobId, stato, turno, addOrder };
  },
};
</script>

<style>
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  margin: auto;
}
input, select, button {
  padding: 10px;
  font-size: 16px;
}
</style>
