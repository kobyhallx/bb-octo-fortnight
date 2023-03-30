import { useRef, useState, useEffect } from 'react';

import { enableLogs } from '@aztec/barretenberg/log';
import {
  setupTurboProverAndVerifier
} from "@aztec/barretenberg";
import initAztecBackend, { serialise_acir_to_barrtenberg_circuit } from '@noir-lang/aztec_backend';


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
        const serializedCircuit = serialise_acir_to_barrtenberg_circuit(acir_bytes);

        const pk_arrayBuffer = await fetch(new URL('../circuit/target/circuit.pk', import.meta.url)).then(r => r.blob()).then(pk_blob => pk_blob.arrayBuffer());
        const vk_arraybuffer = await fetch(new URL('../circuit/target/circuit.vk', import.meta.url)).then(r => r.blob()).then(vk_blob => vk_blob.arrayBuffer());

        let pk = new Uint8Array(pk_arrayBuffer);
        let vk = new Uint8Array(vk_arraybuffer);
        console.log(serializedCircuit, pk, vk)
        setupTurboProverAndVerifier(serializedCircuit, pk, vk);

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
