export type ShowcaseTeacher = {
  id: string;
  name: string;
  image: string;
  topSkills: string[];
};

export type ShowcaseCategory = {
  id: string;
  name: string;
  subCategories: { id: string; name: string; teachers: ShowcaseTeacher[] }[];
};

/** ข้อมูลจำลอง: อย่างน้อย 3 คนต่อหมวดย่อย */
export const SHOWCASE_DATA: ShowcaseCategory[] = [
  {
    id: "voc",
    name: "อาชีวศึกษา",
    subCategories: [
      {
        id: "voc-electric",
        name: "สาขาไฟฟ้าและอิเล็กทรอนิกส์",
        teachers: [
          {
            id: "t1",
            name: "ครูประเสริฐ วิศวกรรม",
            image:
              "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
            topSkills: ["วงจรไฟฟ้า", "PLC", "ความปลอดภัย"],
          },
          {
            id: "t2",
            name: "ครูสุดา แสงไฟ",
            image:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a4?auto=format&fit=crop&w=200&q=80",
            topSkills: ["ซ่อมบำรุง", "ห้องปฏิบัติการ", "โครงงานนักเรียน"],
          },
          {
            id: "t3",
            name: "ครูอนันต์ มอเตอร์",
            image:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
            topSkills: ["มอเตอร์ไฟฟ้า", "เครื่องมือวัด", "Active Learning"],
          },
        ],
      },
      {
        id: "voc-it",
        name: "สาขาเทคโนโลยีสารสนเทศ",
        teachers: [
          {
            id: "t4",
            name: "ครูมาลี เขียนโค้ด",
            image:
              "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
            topSkills: ["เว็บแอป", "ฐานข้อมูล", "ไซเบอร์"],
          },
          {
            id: "t5",
            name: "ครูธนา เน็ตเวิร์ก",
            image:
              "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=200&q=80",
            topSkills: ["เครือข่าย", "Linux", "DevOps เบื้องต้น"],
          },
          {
            id: "t6",
            name: "ครูพิมพ์ใจ UX",
            image:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
            topSkills: ["UI/UX", "การออกแบบสื่อ", "Python"],
          },
        ],
      },
    ],
  },
  {
    id: "academic",
    name: "สายสามัญศึกษา",
    subCategories: [
      {
        id: "ac-math",
        name: "คณิตศาสตร์",
        teachers: [
          {
            id: "t7",
            name: "ครูวิภา ตัวเลข",
            image:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
            topSkills: ["พีชคณิต", "การคิดเชิงรูปธรรม", "STEM"],
          },
          {
            id: "t8",
            name: "ครูสมศักดิ์ เรขา",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            topSkills: ["เรขาคณิต", "GeoGebra", "การวัดผล"],
          },
          {
            id: "t9",
            name: "ครูรัตนา สถิติ",
            image:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            topSkills: ["สถิติ", "Data Literacy", "โครงงาน"],
          },
        ],
      },
      {
        id: "ac-thai",
        name: "ภาษาไทย",
        teachers: [
          {
            id: "t10",
            name: "ครูกมล วรรณคดี",
            image:
              "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80",
            topSkills: ["การอ่านเชิงวิพากษ์", "การเขียนเชิงสร้างสรรค์", "วรรณกรรม"],
          },
          {
            id: "t11",
            name: "ครูนภา ถ้อยคำ",
            image:
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
            topSkills: ["วรรณกรรมท้องถิ่น", "วาทศิลป์", "โครงงานภาษาไทย"],
          },
          {
            id: "t12",
            name: "ครูเทียนทอง กวี",
            image:
              "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
            topSkills: ["บทกวี", "การอ่านออกเสียง", "สื่อดิจิทัล"],
          },
        ],
      },
    ],
  },
];
