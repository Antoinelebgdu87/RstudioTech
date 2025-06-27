import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { UsageStats, License, User } from "../../shared/types";
import {
  BarChart3Icon,
  UsersIcon,
  KeyIcon,
  MessageSquareIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  CopyIcon,
  ShieldIcon,
  TrendingUpIcon,
} from "lucide-react";

const ADMIN_KEY = "admin_rstudio_tech_2024";

export default function Admin() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Formulaire nouvelle licence
  const [newLicense, setNewLicense] = useState({
    type: "trial",
    maxUsage: 100,
    expiresIn: "",
  });
  const [bulkCount, setBulkCount] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  // Vérifier l'authentification admin
  useEffect(() => {
    const storedAdminKey = localStorage.getItem("admin_key");
    if (storedAdminKey === ADMIN_KEY) {
      setAdminKey(storedAdminKey);
      setIsAdminAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminKey === ADMIN_KEY) {
      localStorage.setItem("admin_key", adminKey);
      setIsAdminAuthenticated(true);
      loadAdminData();
      setError("");
    } else {
      setError("Clé admin incorrecte");
    }
  };

  const makeAdminRequest = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      "x-admin-key": ADMIN_KEY,
      "Content-Type": "application/json",
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const loadAdminData = async () => {
    try {
      setIsLoadingData(true);

      const [statsRes, licensesRes, usersRes] = await Promise.all([
        makeAdminRequest("/api/admin/stats"),
        makeAdminRequest("/api/admin/licenses"),
        makeAdminRequest("/api/admin/users"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (licensesRes.ok) {
        const licensesData = await licensesRes.json();
        setLicenses(licensesData.licenses);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error("Erreur chargement données admin:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoadingData(false);
    }
  };

  const createLicense = async () => {
    try {
      setIsCreating(true);

      const expiresIn = newLicense.expiresIn
        ? parseInt(newLicense.expiresIn) * 24 * 60 * 60 * 1000
        : undefined;

      const response = await makeAdminRequest("/api/admin/licenses", {
        method: "POST",
        body: JSON.stringify({
          ...newLicense,
          expiresIn,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLicenses([data.license, ...licenses]);
        setNewLicense({ type: "trial", maxUsage: 100, expiresIn: "" });
        await navigator.clipboard.writeText(data.license.key);
        alert("Licence créée et copiée dans le presse-papier !");
      } else {
        setError("Erreur lors de la création de la licence");
      }
    } catch (error) {
      console.error("Erreur création licence:", error);
      setError("Erreur lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  const createBulkLicenses = async () => {
    try {
      setIsCreating(true);

      const expiresIn = newLicense.expiresIn
        ? parseInt(newLicense.expiresIn) * 24 * 60 * 60 * 1000
        : undefined;

      const response = await makeAdminRequest("/api/admin/licenses/bulk", {
        method: "POST",
        body: JSON.stringify({
          count: bulkCount,
          type: newLicense.type,
          maxUsage: newLicense.maxUsage,
          expiresIn,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLicenses([...data.licenses, ...licenses]);

        // Copier toutes les clés
        const keys = data.licenses.map((l: License) => l.key).join("\n");
        await navigator.clipboard.writeText(keys);
        alert(
          `${data.count} licences créées et copiées dans le presse-papier !`,
        );
      } else {
        setError("Erreur lors de la création en lot");
      }
    } catch (error) {
      console.error("Erreur création en lot:", error);
      setError("Erreur lors de la création");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteLicense = async (licenseKey: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette licence ?")) return;

    try {
      const response = await makeAdminRequest(
        `/api/admin/licenses/${licenseKey}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setLicenses(licenses.filter((l) => l.key !== licenseKey));
      } else {
        setError("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression licence:", error);
      setError("Erreur lors de la suppression");
    }
  };

  const copyLicenseKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    alert("Clé copiée dans le presse-papier !");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case "trial":
        return "bg-orange-100 text-orange-800";
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "unlimited":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Rediriger si pas connecté
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-brand-accent flex items-center justify-center">
              <ShieldIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Accès Admin</CardTitle>
            <CardDescription>
              Saisissez la clé administrateur pour accéder au dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Clé administrateur</Label>
              <Input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Clé admin..."
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleAdminLogin} className="w-full">
              <ShieldIcon className="w-4 h-4 mr-2" />
              Accéder au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Admin</Badge>
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <span>Raccourci:</span>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded font-mono">
                <span>Ctrl+F1</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("admin_key");
                setIsAdminAuthenticated(false);
              }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="licenses">Licences</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="create">Créer</TabsTrigger>
          </TabsList>

          {/* Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Utilisateurs
                    </CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeUsers} actifs (7 derniers jours)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Conversations
                    </CardTitle>
                    <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalConversations}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalMessages} messages totaux
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Licences Trial
                    </CardTitle>
                    <KeyIcon className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.licenseTypes.trial}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Licences d'essai
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Licences Premium
                    </CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.licenseTypes.premium +
                        stats.licenseTypes.unlimited}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Premium + Unlimited
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Licences */}
          <TabsContent value="licenses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gestion des licences</h2>
              <Button onClick={loadAdminData} variant="outline" size="sm">
                Actualiser
              </Button>
            </div>

            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clé</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créée le</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => (
                      <TableRow key={license.id}>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px]">
                              {license.key}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyLicenseKey(license.key)}
                            >
                              <CopyIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLicenseTypeColor(license.type)}>
                            {license.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {license.usageCount} / {license.maxUsage}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((license.usageCount / license.maxUsage) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={license.isActive ? "default" : "secondary"}
                          >
                            {license.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(license.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteLicense(license.key)}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Utilisateurs */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-lg font-semibold">Utilisateurs enregistrés</h2>

            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Clé de licence</TableHead>
                      <TableHead>Conversations</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{user.email || "Non défini"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {user.licenseKey?.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {user.conversationIds?.length || 0}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Créer */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Licence unique */}
              <Card>
                <CardHeader>
                  <CardTitle>Créer une licence</CardTitle>
                  <CardDescription>
                    Générer une nouvelle licence d'accès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type de licence</Label>
                    <Select
                      value={newLicense.type}
                      onValueChange={(value) =>
                        setNewLicense({ ...newLicense, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">
                          Trial (100 messages)
                        </SelectItem>
                        <SelectItem value="basic">
                          Basic (1000 messages)
                        </SelectItem>
                        <SelectItem value="premium">
                          Premium (10000 messages)
                        </SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Limite d'usage</Label>
                    <Input
                      type="number"
                      value={newLicense.maxUsage}
                      onChange={(e) =>
                        setNewLicense({
                          ...newLicense,
                          maxUsage: parseInt(e.target.value) || 100,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiration (jours) - optionnel</Label>
                    <Input
                      type="number"
                      placeholder="Laissez vide pour aucune expiration"
                      value={newLicense.expiresIn}
                      onChange={(e) =>
                        setNewLicense({
                          ...newLicense,
                          expiresIn: e.target.value,
                        })
                      }
                    />
                  </div>

                  <Button
                    onClick={createLicense}
                    disabled={isCreating}
                    className="w-full"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Créer la licence
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Licences en lot */}
              <Card>
                <CardHeader>
                  <CardTitle>Création en lot</CardTitle>
                  <CardDescription>
                    Générer plusieurs licences à la fois
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de licences</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={bulkCount}
                      onChange={(e) =>
                        setBulkCount(parseInt(e.target.value) || 10)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum 100 licences
                    </p>
                  </div>

                  <Button
                    onClick={createBulkLicenses}
                    disabled={isCreating}
                    className="w-full"
                    variant="secondary"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <BarChart3Icon className="w-4 h-4 mr-2" />
                        Créer {bulkCount} licences
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
