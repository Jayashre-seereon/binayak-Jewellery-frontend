import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Today's Sales</p>
            <h2 className="text-2xl font-bold">₹4,52,000</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Today's Purchase</p>
            <h2 className="text-2xl font-bold">₹2,18,500</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Gold Rate</p>
            <h2 className="text-2xl font-bold">₹6,500/gm</h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}