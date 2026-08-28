import { ViewProvider } from "./context/ViewContext";
import { EcoPrawnApp } from "./app/EcoPrawnApp";

export function App() {
  return (
    <ViewProvider>
      <EcoPrawnApp />
    </ViewProvider>
  );
}

export default App;
