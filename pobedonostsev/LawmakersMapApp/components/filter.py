from django_unicorn.components import UnicornView
import requests

class FilterView(UnicornView):

    # def normalize_string(string):
    #     return string.replace("'", "\"").replace("№", "N")
    blocks = dict()
    categories = dict()
    authorities = dict()
    docs_count = dict()
    btnMark = ">"
    blockName = ""
    categoryName = ""
    authorityName = ""
    width_percent=30
    upd = False
        
        
    def get_blocks(self):
        if len(self.blocks)==0:
            if self.upd:
                return
            self.upd = True
            url = "http://publication.pravo.gov.ru/api/PublicBlocks"
            response = requests.get(url)
            json_data = response.json()
            blocks = dict()
            for block in json_data:
                blocks.update({block['name'] : block['code']})
            self.blocks = blocks
            self.upd = False

    def check_block(self):
        if len(self.blocks):
            for key in self.blocks.keys():
                if key == self.blockName:
                    return True

    def get_categories(self):
        if self.upd:
            return
        self.upd = True
        categories = dict()
        if self.check_block():
            url = "http://publication.pravo.gov.ru/api/Categories?block=" + self.blocks.get(self.blockName)
            response = requests.get(url)
            json_data = response.json()
            for category in json_data:
                categories.update({category['name']: category['code']})
            self.categories = categories
        elif self.blockName=="":
            for value in self.blocks.values():
                url = f"http://publication.pravo.gov.ru/api/Categories?block='{value}'"
                response = requests.get(url)
                json_data = response.json()
                for category in json_data:
                    categories.update({category['name']: category['code']})
            self.categories = categories
        self.upd = False

    def check_category(self):
        if len(self.categories):
            for key in self.categories.keys():
                if key == self.categoryName:
                    return True

    def get_authorities(self):
        if (self.upd):
            return
        self.upd = True
        bl = ""
        cat = ""
        if self.check_block():
            bl[0] = f"block={self.blocks.get(self.blockName)}"
        else:
            bl = self.blocks.values()
        if self.check_category():
            cat += f"&category={self.categories.get(self.categoryName)}"
        authorities = dict()
        for block in bl:
            url = f"http://publication.pravo.gov.ru/api/SignatoryAuthorities?block={block}{cat}"
            response = requests.get(url)
            json_data = response.json()
            for authority in json_data:
                authorities.update({authority['name'] : [authority['id'], block]})

        # if self.check_block():
        #     bl = f"block={self.blocks.get(self.blockName)}"
        # if self.check_category():
        #     cat = f"category={self.categories.get(self.categoryName)}"
        #     if not bl=="":
        #         bl+="&"
        # authorities = dict()
        # url = f"http://publication.pravo.gov.ru/api/SignatoryAuthorities?{bl}{cat}"
        # response = requests.get(url)
        # json_data = response.json()
        # for authority in json_data:
        #     authorities.update({authority['name'] : authority['id']})
        self.authorities = authorities
        self.upd = False

    def check_authority(self):
        if len(self.authorities):
            for key in self.authorities.keys():
                if key == self.authorityName:
                    return True


    def hide(self):
        if self.btnMark == ">":
            self.btnMark = "<"
            self.width_percent=0
            return
        if self.btnMark == "<":
            self.btnMark = ">"
            self.width_percent=20


    def get_docs(self):
        bl = ""
        cat = ""
        auth = ""
        if self.check_block():
            bl = f"block={self.blocks.get(self.blockName)}"
        if self.check_category():
            cat = f"category={self.categories.get(self.categoryName)}"
            if not bl == "":
                bl += "&"
        if self.check_authority():
            auth = f"SignatoryAuthorityId={self.authorities.get(self.authorityName)}"
            if (not bl == "") or (not cat == ""):
                auth+="&"
        else:
            self.get_authorities()
        url = f"http://publication.pravo.gov.ru/api/Documents?{bl}{cat}{auth}"
        docs = dict()
        response = requests.get(url)
        json_data = response.json()
        documents = json_data['items']
        for doc in documents:
            key = list(self.authorities.keys())[list(self.authorities.values()).index(doc['signatoryAuthorityId'])]
            docs.update({key: docs.get(key, 0)+1})
        self.docs_count = docs


    def mount(self):
        self.get_blocks()
        self.get_categories()
        self.get_authorities()
        
    def update(self):
        self.get_categories()
        self.get_authorities()
        
    class Meta:
        javascript_exclude = ("categories", "blocks",)