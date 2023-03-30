import { enableLogs } from '@aztec/barretenberg/log';
import {
  setupTurboProverAndVerifier
} from "@aztec/barretenberg";


import './App.css';

function App() {
  // debugger;
  enableLogs("bb:*");
  fetch(new URL('../circuit/target/circuit.json', import.meta.url)).then(r => r.json()).then(compiled_program => {
    let acir_bytes = new Uint8Array(Buffer.from(compiled_program.circuit, "hex"));
    fetch(new URL('../circuit/target/circuit.pk', import.meta.url)).then(r => r.blob()).then(pk_blob => pk_blob.arrayBuffer()).then(pk_arraybuffer => {
      fetch(new URL('../circuit/target/circuit.vk', import.meta.url)).then(r => r.blob()).then(vk_blob => vk_blob.arrayBuffer()).then(vk_arraybuffer => {
        let pk = new Uint8Array(pk_arraybuffer);
        let vk = new Uint8Array(vk_arraybuffer);
        console.log(acir_bytes, pk, vk)
        setupTurboProverAndVerifier(acir_bytes, pk, vk);
      });
    })
  });

  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
