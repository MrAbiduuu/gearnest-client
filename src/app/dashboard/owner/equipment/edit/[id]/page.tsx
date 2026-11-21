import React, { Suspense } from "react";
import EditEquipmentForm from "./edit-equipment-form";

const EditEquipmentFallback = () => (
  <div className="space-y-6">
    <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
    <div className="h-9 w-72 max-w-full animate-pulse rounded-md bg-muted" />
    <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    <div className="h-56 animate-pulse rounded-2xl bg-muted" />
  </div>
);

const EditEquipmentPage = () => (
  <Suspense fallback={<EditEquipmentFallback />}>
    <EditEquipmentForm />
  </Suspense>
);

export default EditEquipmentPage;
