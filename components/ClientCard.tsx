"use client";

import Link from "next/link";
import { Client } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ClientCard({ client, lastTask }: { client: Client; lastTask?: string }) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {client.full_name}
              </h2>
              <p className="text-sm text-gray-500">ת.ז: {client.id_number}</p>
              <p className="text-sm text-gray-500">📞 {client.phone}</p>
            </div>
            <div className="flex flex-col gap-1 text-left items-end">
              <p className="text-sm text-gray-700">
                <span className="font-medium">משכנתא:</span>{" "}
                {formatCurrency(client.mortgage_amount)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">שווי נכס:</span>{" "}
                {formatCurrency(client.property_value)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(client.created_at).toLocaleDateString("he-IL")}
              </p>
            </div>
          </div>
          {lastTask && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
              <span className="text-xs font-medium text-purple-600 shrink-0 mt-0.5">משימה:</span>
              <p className="text-xs text-gray-600 line-clamp-1">{lastTask}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
