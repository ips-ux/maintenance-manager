import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { seedDatabase } from '../utils/seedDatabase';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export default function SeedDatabase() {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    setResults(null);
    setProgress('Starting database seeding...');

    try {
      const result = await seedDatabase({
        includeUnits: true,
        includeVendors: true,
        includeTechnicians: true,
        includeTurns: true,
        includeCalendar: true,
        includeActivities: true
      });

      if (result.success) {
        setResults(result.results);
        setProgress('Database seeding completed successfully!');
      } else {
        setError(result.error);
        setResults(result.results);
        setProgress('Database seeding completed with errors.');
      }
    } catch (err) {
      setError(err.message);
      setProgress('Database seeding failed.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Seeder</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              This will populate your Firestore database with realistic test data including:
            </p>
            <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
              <li>120 units with varying configurations</li>
              <li>6 vendor companies across different categories</li>
              <li>3 technician user profiles</li>
              <li>Active turns with progress tracking</li>
              <li>Calendar events and activity logs</li>
            </ul>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Warning: This will create real documents in your Firestore database.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Make sure you're connected to the correct Firebase project before proceeding.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Display */}
            {progress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{progress}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">Error:</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seeding Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard
                    title="Units"
                    created={results.units.created}
                    errors={results.units.errors}
                  />
                  <ResultCard
                    title="Vendors"
                    created={results.vendors.created}
                    errors={results.vendors.errors}
                  />
                  <ResultCard
                    title="Technicians"
                    created={results.technicians.created}
                    errors={results.technicians.errors}
                  />
                  <ResultCard
                    title="Turns"
                    created={results.turns.created}
                    errors={results.turns.errors}
                  />
                  <ResultCard
                    title="Calendar Events"
                    created={results.calendar.created}
                    errors={results.calendar.errors}
                  />
                  <ResultCard
                    title="Activities"
                    created={results.activities.created}
                    errors={results.activities.errors}
                  />
                </div>

                {results.units.created > 0 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                      ✅ Database seeding completed successfully!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      You can now navigate to the Dashboard to see the data.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex-1"
              >
                {isSeeding ? 'Seeding Database...' : 'Seed Database'}
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                disabled={isSeeding}
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Firebase Console Link */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">
                Verify the data in Firebase Console:
              </p>
              <a
                href="https://console.firebase.google.com/project/maintenance-manager-ae292/firestore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open Firebase Console →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultCard({ title, created, errors }) {
  return (
    <div className="p-4 border rounded-md">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="mt-2 space-y-1">
        <p className="text-lg font-semibold text-green-600">{created} created</p>
        {errors > 0 && (
          <p className="text-sm text-red-600">{errors} errors</p>
        )}
      </div>
    </div>
  );
}
