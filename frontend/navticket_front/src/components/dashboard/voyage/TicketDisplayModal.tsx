import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { Download, Mail, Check } from 'lucide-react';
  import { QRCodeSVG } from 'qrcode.react';
  
  interface TicketDisplayModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingData: {
      booking_reference: string;
      booking_id: number;
      total_amount: string;
      qr_code_data: string;
    } | null;
  }
  
  export const TicketDisplayModal = ({ isOpen, onClose, bookingData }: TicketDisplayModalProps) => {
    if (!bookingData) return null;
  
    const handlePrint = () => {
      window.print();
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              Réservation créée avec succès!
            </DialogTitle>
            <DialogDescription>
              Le billet a été envoyé par email au voyageur
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600 mb-1">Référence de réservation</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookingData.booking_reference}
                </p>
              </div>
  
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={bookingData.qr_code_data}
                    size={180}
                    level="H"
                  />
                </div>
              </div>
  
              <div className="text-center">
                <p className="text-sm text-slate-600">Montant total</p>
                <p className="text-xl font-bold text-slate-900">
                  {parseFloat(bookingData.total_amount).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
  
            <div className="space-y-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Imprimer le billet
              </Button>
  
              <Button
                onClick={onClose}
                className="w-full"
              >
                Terminer
              </Button>
            </div>
  
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Email envoyé</p>
                  <p className="text-blue-700">
                    Le voyageur a reçu son billet électronique avec le QR code et un fichier calendrier pour ajouter le voyage à son agenda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };