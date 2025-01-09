import { useEffect, useState } from "react";

function App() {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("EUR");
  const [toCur, setToCur] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convert = async (abortController) => {
      if (fromCur === toCur) {
        setConvertedAmount(amount.toFixed(2));
        setLoading(false);
        return;
      }

      setError(null);
      setConvertedAmount("");
      setLoading(true);

      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${fromCur}&symbols=${toCur}`,
          { signal: abortController.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch conversion rates");
        const data = await res.json();

        // Handle case where NGN is not directly supported
        if (toCur === "NGN") {
          // Example: Assume 1 USD = 1500 NGN as a static rate (replace with dynamic source if available)
          const staticNairaRate = 1500;
          setConvertedAmount((amount * staticNairaRate).toFixed(2));
        } else {
          setConvertedAmount((amount * data.rates[toCur]).toFixed(2));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    const abortController = new AbortController();
    convert(abortController);

    return () => {
      abortController.abort();
    };
  }, [amount, fromCur, toCur]);

  useEffect(() => {
    document.title = "currency converter";
  }, []);

  return (
    <div className="container">
      <h1>Currency Converter</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount"
      />
      <select
        disabled={loading}
        value={fromCur}
        onChange={(e) => setFromCur(e.target.value)}>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
        <option value="NGN">NGN</option>
      </select>
      <select
        disabled={loading}
        value={toCur}
        onChange={(e) => setToCur(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
        <option value="NGN">NGN</option>
      </select>
      {loading ? (
        <p>Loading...</p>
      ) : convertedAmount ? (
        <p>
          {amount} {fromCur} = {convertedAmount} {toCur}
        </p>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
}

export default App;
