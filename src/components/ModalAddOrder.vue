<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Inserisci Nuovo Ordine</h2>
      <div class="form-row">
        <input v-model="cliente" type="text" placeholder="Inserisci il nome del cliente" />
        <input v-model="materiale" type="text" placeholder="Inserisci il materiale" />
        <select v-model="lavorazione">
          <option disabled value="">Seleziona lavorazione</option>
          <option value="Taglio">Taglio</option>
          <option value="Piegatura">Piegatura</option>
          <option value="Taglio + Piegatura">Taglio + Piegatura</option>
          <option value="Satinatura">Satinatura</option>
        </select>
      </div>
      <div class="form-row">
        <label for="data">Data (gg/mm/aaaa):</label>
        <!-- Aggiunta della classe no-icon per rimuovere l'icona -->
        <input id="data" v-model="data" type="date" placeholder="gg/mm/aaaa" class="no-icon" />
        <input v-model="jobId" type="number" placeholder="Inserisci numero Job" />
        <input v-model="numeroOrdine" type="number" placeholder="Inserisci numero ordine" />
        <select v-model="stato">
          <option disabled value="">Seleziona stato</option>
          <option value="In attesa">In attesa</option>
          <option value="In lavorazione">In lavorazione</option>
          <option value="Lavorato">Lavorato</option>
        </select>
        <select v-model="turno">
          <option disabled value="">Seleziona turno</option>
          <option value="Mattina">Mattina</option>
          <option value="Pomeriggio">Pomeriggio</option>
          <option value="Notte">Notte</option>
        </select>
      </div>
      <div class="buttons">
        <button @click="submitOrder">Aggiungi Ordine</button>
        <button @click="closeModal" class="close-btn">Chiudi</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalAddOrder",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "order-added"],
  data() {
    return {
      cliente: "",
      materiale: "",
      lavorazione: "",
      data: "",
      jobId: "",
      numeroOrdine: "",
      stato: "In attesa",
      turno: "Mattina",
    };
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    submitOrder() {
      const order = {
        cliente: this.cliente,
        materiale: this.materiale,
        lavorazione: this.lavorazione,
        data: this.data,
        jobId: this.jobId,
        numeroOrdine: this.numeroOrdine,
        stato: this.stato,
        turno: this.turno,
      };
      this.$emit("order-added", order);
      // Reset dei campi
      this.cliente = "";
      this.materiale = "";
      this.lavorazione = "";
      this.data = "";
      this.jobId = "";
      this.numeroOrdine = "";
      this.stato = "In attesa";
      this.turno = "Mattina";
      this.closeModal();
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}
.form-row input,
.form-row select {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.buttons {
  display: flex;
  justify-content: space-between;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
.close-btn {
  background-color: #dc3545;
  color: #fff;
  border: none;
  border-radius: 5px;
}
button:not(.close-btn) {
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
}

.no-icon {
  background-image: none !important;
  max-width: 200px; /* Imposta qui la larghezza massima desiderata */
}

/* Se vuoi applicarlo solo al campo data all'interno del modal */
.modal-content .form-row input[type="date"].no-icon {
  max-width: 200px; /* Regola il valore secondo le tue esigenze */
}
</style>
