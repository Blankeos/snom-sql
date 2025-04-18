import { ColumnDef } from '@tanstack/solid-table';
import { GroupPanelPartInitParameters } from 'dockview-core';
import { Component } from 'solid-js';
import DataTable from '../ui/data-table';

// Define the data type
type CarModel = {
  index: number;
  brand_id: number;
  brand_name: string;
  model_base_price: number;
  model_id: number;
  model_name: string;
};

// Define the columns
const columns: ColumnDef<CarModel>[] = [
  { accessorKey: 'index', header: '#' },
  { accessorKey: 'brand_id', header: 'Brand ID' },
  { accessorKey: 'brand_name', header: 'Brand Name' },
  { accessorKey: 'model_base_price', header: 'Base Price' },
  { accessorKey: 'model_id', header: 'Model ID' },
  { accessorKey: 'model_name', header: 'Model Name' },
];

// Prepare the data
const carData: CarModel[] = [
  {
    index: 1,
    brand_id: 4,
    brand_name: 'Ferrari',
    model_base_price: 125000,
    model_id: 10,
    model_name: 'LaFerrari',
  },
  {
    index: 2,
    brand_id: 4,
    brand_name: 'Ferrari',
    model_base_price: 75000,
    model_id: 11,
    model_name: '458',
  },
  {
    index: 3,
    brand_id: 4,
    brand_name: 'Ferrari',
    model_base_price: 110000,
    model_id: 12,
    model_name: 'F12 Berlinetta',
  },
  {
    index: 4,
    brand_id: 4,
    brand_name: 'Ferrari',
    model_base_price: 100000,
    model_id: 13,
    model_name: 'F40',
  },
];

export const ResultsPanel: Component<{ params: GroupPanelPartInitParameters }> = (props) => {
  return (
    <div class="">
      <DataTable columns={columns} data={carData} />
    </div>
  );
};
