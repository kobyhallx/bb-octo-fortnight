import { useRef, useState, useEffect } from 'react';

import { enableLogs } from '@aztec/barretenberg/log';
import {
  setupTurboProverAndVerifier
} from "@aztec/barretenberg";
import initAztecBackend, { serialize_acir_to_barretenberg_circuit } from '@noir-lang/aztec_backend_wasm';

import './App.css';

function App() {

  const [nargoArtifacts, _setNargoArtifacts] = useState(false);

  const setNargoArtifacts = (artifactsObject) => {
    nargoArtifacts.current = artifactsObject;
    _setNargoArtifacts(artifactsObject);
  };

  useEffect(() => {
    const fetchArtifacts = async () => {
      if (!nargoArtifacts) {
        const circuitJson = await fetch(new URL('../circuit/target/circuit.json', import.meta.url)).then(r => r.json());

        let acir_bytes = new Uint8Array(Buffer.from(circuitJson.circuit, "hex"));

        await initAztecBackend();

        const pk_arrayBuffer = await fetch(new URL('../circuit/target/circuit.pk', import.meta.url)).then(r => r.blob()).then(pk_blob => pk_blob.arrayBuffer());
        const vk_arraybuffer = await fetch(new URL('../circuit/target/circuit.vk', import.meta.url)).then(r => r.blob()).then(vk_blob => vk_blob.arrayBuffer());
        const witness_arrayBuffer = await fetch(new URL('../circuit/target/circuit.tr', import.meta.url)).then(r => r.blob()).then(blob => blob.arrayBuffer());

        let pk = new Uint8Array(pk_arrayBuffer);
        let vk = new Uint8Array(vk_arraybuffer);
        let witness = new Uint8Array(witness_arrayBuffer);

        const serializedCircuit = serialize_acir_to_barretenberg_circuit(acir_bytes);

        const [turboProver, turboVerifier] = await setupTurboProverAndVerifier(serializedCircuit, pk, vk);
        
      }
    }

    fetchArtifacts();
  })

  enableLogs("bb:*");

  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
