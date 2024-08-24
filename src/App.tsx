import { useState } from 'react';
import { FullScreenPulsingContainer } from '../';


function App() {
  const [count, setCount] = useState(0)
  const [inputCustomCountValue, setInputCustomCountValue] = useState('');

  const handleClickCustomCount = () => {
    if (inputCustomCountValue === '') {
      setCount(count => count + 1);
    } else {
      setCount(Number(inputCustomCountValue));
    }
  }

  return (
    <>
      <FullScreenPulsingContainer>
        <div>

        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <input
            placeholder="Custom count"
            value={inputCustomCountValue}
            onChange={(e) => setInputCustomCountValue(e.target.value)}
          /><br />
          <button onClick={handleClickCustomCount}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </FullScreenPulsingContainer>
    </>
  )
}

export default App