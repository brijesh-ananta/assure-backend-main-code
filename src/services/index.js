import CardProfileService from "./cardProfileService";
import issuersService from "./issuersService";
import userService from "./userService";
import PartnerService from "./testingPartner";
import TestCardBundlesService from "./testCardBundles";
import CardService from "./card";
import NotificationService from "./notification";
import AuditTrailService from "./auditTrail";
import CountriesService from "./countries";
import MccCodeService from "./mccCode";
import BrandsService from "./brands";
import RequestsService from "./requests";

const apiService = {
  cardProfile: CardProfileService,
  issuers: issuersService,
  user: userService,
  testingPartner: PartnerService,
  testCardBundles: TestCardBundlesService,
  card: CardService,
  notification: NotificationService,
  auditTrail: AuditTrailService,
  countries: CountriesService,
  mccCode: MccCodeService,
  brands: BrandsService,
  requests: RequestsService
};

export default apiService;
