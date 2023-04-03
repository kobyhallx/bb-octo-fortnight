import { useRef, useState, useEffect } from 'react';

import { enableLogs } from '@aztec/barretenberg/log';
import {
  setupTurboProverAndVerifier
} from "@aztec/barretenberg";
import initAztecBackend, { serialize_acir_to_barretenberg_circuit, decompress_witness_map } from '@noir-lang/aztec_backend_wasm';

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

        const acir_bytes = new Uint8Array(Buffer.from(circuitJson.circuit, "hex"));

        await initAztecBackend();

        const pk_arrayBuffer = await fetch(new URL('../circuit/target/circuit.pk', import.meta.url)).then(r => r.blob()).then(pk_blob => pk_blob.arrayBuffer());
        const vk_arraybuffer = await fetch(new URL('../circuit/target/circuit.vk', import.meta.url)).then(r => r.blob()).then(vk_blob => vk_blob.arrayBuffer());
        const witness_arrayBuffer = await fetch(new URL('../circuit/target/circuit.tr', import.meta.url)).then(r => r.blob()).then(blob => blob.arrayBuffer());

        const pk = new Uint8Array(pk_arrayBuffer);
        const vk = new Uint8Array(vk_arraybuffer);
        const witness = new Uint8Array(witness_arrayBuffer);

        const serializedCircuit = serialize_acir_to_barretenberg_circuit(acir_bytes);
        const [turboProver, turboVerifier] = await setupTurboProverAndVerifier(serializedCircuit, pk, vk);

        // BB expects a decompressed format of the witness map.
        const decompressed_witness = decompress_witness_map(witness, acir_bytes)

        // TODO: change this interface to return public-inputs and proof separately.
        const proof = await turboProver.createProof(decompressed_witness)
        console.log("proof", proof)

        // TODO: change this interface to accept public-inputs and proof separately.
        const verified = await turboVerifier.verifyProof(proof);
        console.log("verified", verified)
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
