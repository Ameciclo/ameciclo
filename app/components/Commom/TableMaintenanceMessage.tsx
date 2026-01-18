import { AlertCircle } from "lucide-react";

export default function MaintenanceMessage() {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
      <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Em Manutenção
      </h3>
      <p className="text-gray-600">
        Esta seção está temporariamente indisponível para melhorias.
      </p>
    </div>
  );
}
