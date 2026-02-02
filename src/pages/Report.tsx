import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Layout from '@/components/layout/Layout';
import MapView from '@/components/map/MapView';
import { useCreateIncident } from '@/hooks/useIncidents';
import { useAuth } from '@/context/AuthContext';
import { INCIDENT_CATEGORIES, IncidentCategory, CHICAGO_CENTER } from '@/types';

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const createIncident = useCreateIncident();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IncidentCategory | '',
    location: '',
    latitude: CHICAGO_CENTER.lat,
    longitude: CHICAGO_CENTER.lng,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as IncidentCategory }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createIncident.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category as IncidentCategory,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/map');
      }, 2000);
    } catch (error) {
      setErrors({ submit: 'Failed to submit report. Please try again.' });
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center py-8">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
              <h2 className="mb-2 text-xl font-semibold">Report Submitted!</h2>
              <p className="text-muted-foreground">
                Thank you for helping keep Chicago safe. Redirecting to map...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 md:py-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-primary" />
            Report an Incident
          </h1>
          <p className="text-muted-foreground">
            Help fellow travelers by reporting safety concerns
          </p>
        </div>

        {!isAuthenticated && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can submit reports without logging in, but creating an account helps track your contributions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>
                Provide as much detail as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Brief title for the incident"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what happened and any safety tips..."
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location Name *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Millennium Park, Navy Pier"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                </div>

                {errors.submit && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createIncident.isPending}
                >
                  {createIncident.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map for location selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Select Location
              </CardTitle>
              <CardDescription>
                Click on the map to set the incident location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-hidden rounded-lg">
                <MapView
                  incidents={[]}
                  clickableMap
                  onMapClick={handleMapClick}
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  zoom={14}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                📍 Selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
