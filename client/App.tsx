import LicenseGate from "./pages/LicenseGate";

function App() {
  return <LicenseGate onLicenseValidated={() => window.location.reload()} />;
}

export default App;
